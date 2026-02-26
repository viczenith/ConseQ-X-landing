from __future__ import annotations

import time
from datetime import timedelta
from typing import Any, Dict

from django.shortcuts import get_object_or_404

from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify
from django.conf import settings
from rest_framework import permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .domain import (
	CANONICAL_SYSTEMS,
	analyze_filename_or_text,
	compute_org_health,
	deterministic_system_metrics,
	make_series,
	normalize_system_key,
	score_system,
)
from .models import AssessmentRun, Job, Notification, Organization, Upload, UserProfile, Visitor
from .permissions import IsSuperAdmin, IsSuperuserOrTenantUser, get_user_org
from .tenancy import resolve_request_org
from .serializers import (
	AssessmentRunSerializer,
	AdminUserSerializer,
	JobSerializer,
	NotificationSerializer,
	OrganizationSerializer,
	RegisterSerializer,
	UploadSerializer,
	UserSerializer,
	VisitorSerializer,
)


def _now_ms() -> int:
	return int(time.time() * 1000)


def _make_run_id(prefix: str) -> str:
	return f"{prefix}-{int(time.time())}-{_now_ms() % 100000:05d}"


def _now_iso() -> str:
	return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


class DemoBootstrapSuperAdminView(APIView):
	"""DEV-ONLY: Creates/updates a demo Super Admin user on localhost.

	Guardrails:
	- Only available when settings.DEBUG is True
	- Only accessible from loopback (127.0.0.1 / ::1)
	"""

	permission_classes = [permissions.AllowAny]
	throttle_scope = "auth"

	def post(self, request):
		if not getattr(settings, "DEBUG", False):
			return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

		remote = (request.META.get("REMOTE_ADDR") or "").strip()
		if remote not in {"127.0.0.1", "::1"}:
			return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

		email = "demo.superadmin@example.com"
		password = "DemoPass123!"
		username = email

		with transaction.atomic():
			user, _created = User.objects.get_or_create(username=username, defaults={"email": email})
			user.email = email
			user.is_active = True
			user.is_staff = True
			user.is_superuser = True
			user.set_password(password)
			user.save()

		return Response(
			{
				"ok": True,
				"demo": {
					"username": username,
					"email": email,
					"password": password,
					"is_superuser": True,
				},
			},
			status=status.HTTP_200_OK,
		)


class HealthView(APIView):
	permission_classes = [permissions.AllowAny]

	def get(self, request):
		return Response({"ok": True, "service": "ceo_backend", "ts": _now_ms()})


class RegisterView(APIView):
	permission_classes = [permissions.AllowAny]
	throttle_scope = "auth"

	def post(self, request):
		ser = RegisterSerializer(data=request.data)
		ser.is_valid(raise_exception=True)
		data = ser.validated_data

		email = str(data["email"]).strip().lower()
		username = email
		ceo_name = str(data["ceo_name"]).strip()
		org_name = str(data["org_name"]).strip()

		# simple name split
		first_name = ceo_name.split(" ")[0] if ceo_name else ""
		last_name = " ".join(ceo_name.split(" ")[1:]) if len(ceo_name.split(" ")) > 1 else ""

		base_slug = slugify(org_name) or "org"
		slug = base_slug
		n = 2
		while Organization.objects.filter(slug=slug).exists():
			slug = f"{base_slug}-{n}"
			n += 1

		with transaction.atomic():
			if User.objects.filter(username=username).exists() or User.objects.filter(email=email).exists():
				return Response({"error": "User already exists"}, status=status.HTTP_409_CONFLICT)

			org = Organization.objects.create(name=org_name, slug=slug)

			user = User.objects.create(username=username, email=email, first_name=first_name, last_name=last_name)
			user.set_password(data["password"])
			user.save()

			UserProfile.objects.create(user=user, organization=org, phone=str(data["phone"]))

		return Response({"user": UserSerializer(user).data, "org": OrganizationSerializer(org).data})


class MeView(APIView):
	permission_classes = [IsSuperuserOrTenantUser]

	def get(self, request):
		user = request.user
		org = None
		# Super Admins are not company users; they may have no org.
		# If they need tenant-scoped context, they can request it explicitly.
		if getattr(user, "is_superuser", False):
			org_id = request.query_params.get("org_id")
			if org_id:
				try:
					org = Organization.objects.get(id=org_id)
				except Organization.DoesNotExist:
					return Response({"detail": "Invalid org_id"}, status=status.HTTP_400_BAD_REQUEST)
		else:
			org = get_user_org(request)

		return Response({"user": UserSerializer(user).data, "org": OrganizationSerializer(org).data if org else None})


class ChangePasswordView(APIView):
	"""Allow authenticated users to change their password."""
	permission_classes = [IsAuthenticated]

	def post(self, request):
		user = request.user
		old_password = request.data.get("old_password", "")
		new_password = request.data.get("new_password", "")

		if not old_password or not new_password:
			return Response({"detail": "Both old_password and new_password are required."}, status=status.HTTP_400_BAD_REQUEST)

		if not user.check_password(old_password):
			return Response({"detail": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

		if len(new_password) < 8:
			return Response({"detail": "New password must be at least 8 characters."}, status=status.HTTP_400_BAD_REQUEST)

		user.set_password(new_password)
		user.save()
		return Response({"detail": "Password changed successfully."})


class SelfUpgradeView(APIView):
	"""Allow authenticated users to upgrade their org subscription tier.

	In production this would be gated behind a payment provider callback.
	For the demo / assessment flow it simply sets the tier.
	"""

	permission_classes = [IsSuperuserOrTenantUser]

	def post(self, request):
		user = request.user
		org = None

		if hasattr(user, "profile") and getattr(user.profile, "organization", None):
			org = user.profile.organization
		elif getattr(user, "is_superuser", False):
			org_id = request.data.get("org_id")
			if org_id:
				org = get_object_or_404(Organization, id=org_id)

		if not org:
			return Response({"error": "No organization associated with this account"}, status=status.HTTP_400_BAD_REQUEST)

		tier = str(request.data.get("tier", "premium")).strip().lower()
		months = int(request.data.get("months", 12))

		if tier not in ("free", "premium"):
			return Response({"error": "Invalid tier – choose free or premium"}, status=status.HTTP_400_BAD_REQUEST)

		org.subscription_tier = tier
		if tier == "premium":
			org.subscription_expires_at = timezone.now() + timedelta(days=months * 30)
		else:
			org.subscription_expires_at = None
		org.save()

		return Response(OrganizationSerializer(org).data)


class OrganizationListCreateView(APIView):
	"""Read-only list of all organisations. Companies are created only via
	the public CEO signup/registration flow — never by a SuperAdmin."""
	permission_classes = [IsSuperAdmin]

	def get(self, request):
		qs = Organization.objects.order_by("-created_at")[:200]
		return Response(OrganizationSerializer(qs, many=True).data)


class OrganizationDetailView(APIView):
	"""Read + governance actions on a single org.

	GET   — full org detail
	PATCH — restricted to status changes (suspend / ban / restore) only.
	        Name, slug, and subscription fields are tenant-owned — SuperAdmin
	        must NOT modify them.
	DELETE — permanent removal of org and all data.
	"""
	permission_classes = [IsSuperAdmin]

	def get(self, request, org_id):
		org = get_object_or_404(Organization, id=org_id)
		return Response(OrganizationSerializer(org).data)

	def patch(self, request, org_id):
		org = get_object_or_404(Organization, id=org_id)
		body = request.data if isinstance(request.data, dict) else {}

		new_status = body.get("status")
		valid = {c[0] for c in Organization.Status.choices}
		if new_status not in valid:
			return Response(
				{"error": f"status must be one of: {', '.join(valid)}"},
				status=status.HTTP_400_BAD_REQUEST,
			)

		org.status = new_status
		org.status_reason = str(body.get("status_reason", "")).strip()
		org.status_changed_at = timezone.now()
		org.status_changed_by = request.user.email or request.user.username
		org.save(update_fields=["status", "status_reason", "status_changed_at", "status_changed_by"])

		# When suspending or banning, also deactivate all users in the org
		if new_status in ("suspended", "banned"):
			user_ids = UserProfile.objects.filter(organization=org).values_list("user_id", flat=True)
			User.objects.filter(id__in=user_ids).update(is_active=False)

		# When restoring, reactivate users
		if new_status == "active":
			user_ids = UserProfile.objects.filter(organization=org).values_list("user_id", flat=True)
			User.objects.filter(id__in=user_ids).update(is_active=True)

		return Response(OrganizationSerializer(org).data)

	def delete(self, request, org_id):
		org = get_object_or_404(Organization, id=org_id)
		# Clean up tenant-scoped data to avoid leaving orphaned records.
		Upload.objects.filter(organization=org).delete()
		AssessmentRun.objects.filter(organization=org).delete()
		Job.objects.filter(organization=org).delete()
		Notification.objects.filter(organization=org).delete()
		UserProfile.objects.filter(organization=org).update(organization=None)
		org.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)


class AdminOrgStatsView(APIView):
	permission_classes = [IsSuperAdmin]

	def get(self, request, org_id):
		org = get_object_or_404(Organization, id=org_id)
		uploads_qs = Upload.objects.filter(organization=org)
		runs_qs = AssessmentRun.objects.filter(organization=org)
		jobs_qs = Job.objects.filter(organization=org)
		nots_qs = Notification.objects.filter(organization=org)

		payload = {
			"orgId": str(org.id),
			"orgSlug": org.slug,
			"counts": {
				"uploads": uploads_qs.count(),
				"assessments": runs_qs.count(),
				"jobs": jobs_qs.count(),
				"notifications": nots_qs.count(),
				"users": UserProfile.objects.filter(organization=org).count(),
			},
			"latest": {
				"upload": uploads_qs.order_by("-timestamp_ms").values_list("timestamp_ms", flat=True).first(),
				"assessment": runs_qs.order_by("-timestamp_ms").values_list("timestamp_ms", flat=True).first(),
				"job_updated": jobs_qs.order_by("-updated_at").values_list("updated_at", flat=True).first(),
				"notification": nots_qs.order_by("-timestamp_ms").values_list("timestamp_ms", flat=True).first(),
			},
		}
		return Response(payload)


class AdminUserListView(APIView):
	"""Read-only list of all users.  User accounts are created only via
	the public CEO signup/registration flow — never by a SuperAdmin."""
	permission_classes = [IsSuperAdmin]

	def get(self, request):
		qs = User.objects.order_by("-date_joined")[:500]
		return Response(AdminUserSerializer(qs, many=True).data)


class AdminUserUpdateView(APIView):
	"""Governance actions on a user account.

	Accepted body fields:
	- status: "active" | "suspended" | "banned"  (sets profile status + is_active)
	- status_reason: optional reason string
	"""
	permission_classes = [IsSuperAdmin]

	def patch(self, request, user_id: int):
		user = get_object_or_404(User, id=user_id)
		body = request.data if isinstance(request.data, dict) else {}
		new_status = body.get("status")

		valid = {c[0] for c in UserProfile.Status.choices}
		if new_status not in valid:
			return Response(
				{"error": f"status must be one of: {', '.join(valid)}"},
				status=status.HTTP_400_BAD_REQUEST,
			)

		profile, _created = UserProfile.objects.get_or_create(user=user)
		profile.status = new_status
		profile.status_reason = str(body.get("status_reason", "")).strip()
		profile.status_changed_at = timezone.now()
		profile.status_changed_by = request.user.email or request.user.username
		profile.save(update_fields=["status", "status_reason", "status_changed_at", "status_changed_by"])

		# Sync Django is_active flag
		user.is_active = (new_status == "active")
		user.save(update_fields=["is_active"])

		return Response(AdminUserSerializer(user).data)

	def delete(self, request, user_id: int):
		"""Permanently delete a user and their profile."""
		user = get_object_or_404(User, id=user_id)
		if user.is_superuser:
			return Response(
				{"error": "Cannot delete a Super Admin account"},
				status=status.HTTP_403_FORBIDDEN,
			)
		# Remove profile first
		UserProfile.objects.filter(user=user).delete()
		user.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)


class AdminOrgUploadsView(APIView):
	permission_classes = [IsSuperAdmin]

	def get(self, request, org_id):
		org = get_object_or_404(Organization, id=org_id)
		qs = Upload.objects.filter(organization=org).order_by("-timestamp_ms")[:500]
		return Response(UploadSerializer(qs, many=True).data)


class AdminOrgAssessmentsView(APIView):
	permission_classes = [IsSuperAdmin]

	def get(self, request, org_id):
		org = get_object_or_404(Organization, id=org_id)
		qs = AssessmentRun.objects.filter(organization=org).order_by("-timestamp_ms")[:500]
		return Response(AssessmentRunSerializer(qs, many=True).data)


class AdminOrgJobsView(APIView):
	permission_classes = [IsSuperAdmin]

	def get(self, request, org_id):
		org = get_object_or_404(Organization, id=org_id)
		qs = Job.objects.filter(organization=org).order_by("-updated_at")[:500]
		return Response(JobSerializer(qs, many=True).data)


class AdminOrgNotificationsView(APIView):
	permission_classes = [IsSuperAdmin]

	def get(self, request, org_id):
		org = get_object_or_404(Organization, id=org_id)
		qs = Notification.objects.filter(organization=org).order_by("-timestamp_ms")[:500]
		return Response(NotificationSerializer(qs, many=True).data)


class OverviewView(APIView):
	permission_classes = [IsSuperuserOrTenantUser]

	def get(self, request):
		org = resolve_request_org(request)
		org_id = str(org.id)

		# scores from latest assessment per system; fallback to upload-derived; else random-ish
		scores: Dict[str, int] = {k: 50 for k in CANONICAL_SYSTEMS}
		latest_upload_ts = None

		# latest assessment scores
		latest_by_sys: Dict[str, int] = {}
		runs = AssessmentRun.objects.filter(organization=org).order_by("-timestamp_ms")[:500]
		for r in runs:
			k = normalize_system_key(r.system_id)
			if k not in latest_by_sys:
				latest_by_sys[k] = int(r.score)
		for k in CANONICAL_SYSTEMS:
			if k in latest_by_sys:
				scores[k] = int(latest_by_sys[k])

		latest_upload = Upload.objects.filter(organization=org).order_by("-timestamp_ms").first()
		if latest_upload:
			latest_upload_ts = int(latest_upload.timestamp_ms)
			for k in latest_upload.analyzed_systems or []:
				kk = normalize_system_key(k)
				if kk in scores and kk not in latest_by_sys:
					scores[kk] = 70

		per_system_series = {k: make_series(int(scores.get(k) or 50)) for k in CANONICAL_SYSTEMS}
		overall = int(round(sum(scores.values()) / max(1, len(scores))))
		overall_series = make_series(overall)

		payload = {
			"overallSeries": overall_series,
			"perSystemSeries": per_system_series,
			"scores": scores,
			"latest_upload_ts": latest_upload_ts,
			"org_id": org_id,
		}
		return Response(payload)


class EnqueueJobView(APIView):
	permission_classes = [IsSuperuserOrTenantUser]

	def post(self, request):
		org = resolve_request_org(request)
		body = request.data if isinstance(request.data, dict) else {}

		job_name = str(body.get("name") or body.get("fileName") or "")
		sys_id = normalize_system_key(body.get("system") or body.get("systemId") or body.get("system_id") or "")
		notify_to = str(body.get("notifyTo") or body.get("orgEmail") or "")

		job = Job.objects.create(
			organization=org,
			name=job_name,
			system_id=sys_id if sys_id in CANONICAL_SYSTEMS else "",
			notify_to=notify_to,
			payload=body,
			status=Job.Status.PENDING,
		)

		# mimic mockApi.js response shape
		return Response({"ok": True, "queued": {**body, "id": str(job.id)}})


class RunAssessmentView(APIView):
	permission_classes = [IsSuperuserOrTenantUser]

	def post(self, request):
		org = resolve_request_org(request)
		org_seed = str(org.id)

		system_key = normalize_system_key(request.data.get("system_key") or request.data.get("systemKey") or request.data.get("systemId"))
		if system_key not in CANONICAL_SYSTEMS:
			return Response({"error": "invalid system_key"}, status=status.HTTP_400_BAD_REQUEST)

		metrics = deterministic_system_metrics(org_seed, system_key)
		weights = {"throughput": 1, "cycle_time": 1, "quality": 1, "predictability": 1}
		scored = score_system(metrics, weights)

		title = f"{system_key.title()} Assessment"
		run = AssessmentRun.objects.create(
			organization=org,
			system_id=system_key,
			title=title,
			score=int(scored["score"]),
			coverage=float(scored["coverage"]),
			timestamp_ms=_now_ms(),
			meta={"simulated": True, "rationale": scored.get("rationale"), "metrics": metrics, "weights": weights},
		)

		return Response(AssessmentRunSerializer(run).data)


def _calculate_delta_mom(runs, system_key: str) -> float:
	filtered = [r for r in runs if normalize_system_key(r.system_id) == system_key]
	filtered.sort(key=lambda r: int(r.timestamp_ms or 0), reverse=True)
	if len(filtered) < 2:
		return 0.0
	latest = float(filtered[0].score or 0)
	previous = float(filtered[1].score or 0)
	return round(latest - previous, 1)


def _generate_health_indicators(system_key: str, score: int) -> list[str]:
	indicators: list[str] = []
	if score > 80:
		indicators.append("excellent_performance")
	if score > 60:
		indicators.append("above_average")
	if score < 40:
		indicators.append("needs_attention")
	if score < 25:
		indicators.append("critical_risk")

	if system_key == "interdependency":
		indicators.append("strong_collaboration" if score > 70 else "siloed_operations")
	if system_key == "orchestration":
		indicators.append("agile_culture" if score > 70 else "slow_adaptation")
	if system_key == "investigation":
		indicators.append("data_driven" if score > 70 else "limited_insights")
	if system_key == "interpretation":
		indicators.append("strategic_clarity" if score > 70 else "decision_gaps")
	if system_key == "illustration":
		indicators.append("clear_communication" if score > 70 else "information_bottlenecks")
	if system_key == "inlignment":
		indicators.append("unified_direction" if score > 70 else "misaligned_goals")

	return indicators


def _identify_risk_factors(score: int) -> list[dict[str, Any]]:
	risks: list[dict[str, Any]] = []
	if score < 40:
		risks.append(
			{
				"factor": "performance_degradation",
				"severity": "critical" if score < 25 else "high",
				"impact": "Significant impact on organizational effectiveness",
			}
		)
	if score < 60:
		risks.append({"factor": "below_benchmark", "severity": "medium", "impact": "Operating below potential"})
	return risks


class DashboardSummaryView(APIView):
	permission_classes = [IsSuperuserOrTenantUser]

	def get(self, request):
		org = resolve_request_org(request)
		org_id = str(org.id)

		runs_qs = AssessmentRun.objects.filter(organization=org).order_by("-timestamp_ms")[:1000]
		runs = list(runs_qs)

		latest_by_sys: Dict[str, AssessmentRun] = {}
		for r in runs:
			k = normalize_system_key(r.system_id)
			if k not in latest_by_sys:
				latest_by_sys[k] = r

		# systemScores for org health
		system_scores = []
		for k in CANONICAL_SYSTEMS:
			latest = latest_by_sys.get(k)
			if latest:
				system_scores.append({"key": k, "score": int(latest.score or 0), "coverage": float(latest.coverage or 1)})
			else:
				system_scores.append({"key": k, "score": 50, "coverage": 0.5})

		computed = compute_org_health(system_scores)
		org_health = int(computed["orgHealth"])
		confidence = float(computed["confidence"])

		systems = []
		for k in CANONICAL_SYSTEMS:
			latest = latest_by_sys.get(k)
			score = int(latest.score) if latest else None
			systems.append(
				{
					"key": k,
					"title": k.title(),
					"score": score,
					"delta_mom": _calculate_delta_mom(runs, k) if latest else 0,
					"top_insight_id": f"ins-{k}-001" if latest else None,
					"health_indicators": _generate_health_indicators(k, int(score or 0)) if latest else [],
					"risk_factors": _identify_risk_factors(int(score or 0)) if latest else [],
				}
			)

		# lightweight “organizational insights” (mirrors mockService shape)
		cultural_factors = {
			"collaboration_index": int(round((latest_by_sys.get("interdependency").score if latest_by_sys.get("interdependency") else 50) * 0.8 + (latest_by_sys.get("inlignment").score if latest_by_sys.get("inlignment") else 50) * 0.2)),
			"innovation_velocity": int(round((latest_by_sys.get("orchestration").score if latest_by_sys.get("orchestration") else 50) * 0.7 + (latest_by_sys.get("investigation").score if latest_by_sys.get("investigation") else 50) * 0.3)),
			"communication_effectiveness": int(latest_by_sys.get("illustration").score) if latest_by_sys.get("illustration") else 50,
			"decision_quality": int(latest_by_sys.get("interpretation").score) if latest_by_sys.get("interpretation") else 50,
			"overall_culture_health": int(round((org_health * 0.9) + (confidence * 100 * 0.1))),
		}

		deps = []
		latest_scores = {k: (int(latest_by_sys[k].score) if k in latest_by_sys else 50) for k in CANONICAL_SYSTEMS}
		for sys in CANONICAL_SYSTEMS:
			impacted_by = [
				other
				for other in CANONICAL_SYSTEMS
				if other != sys and abs((latest_scores.get(sys, 50) - latest_scores.get(other, 50))) < 15
			]
			deps.append(
				{
					"system": sys,
					"depends_on": impacted_by,
					"impact_strength": "high" if impacted_by else "medium",
					"bottleneck_risk": "critical" if latest_scores.get(sys, 50) < 40 else "low",
				}
			)

		recommendations = [
			{
				"insight_id": "rec-001",
				"action": "Focus on foundational systems" if org_health < 60 else "Optimize high-performing areas",
				"owner": "Chief Operating Officer" if org_health < 60 else "Strategic Planning Team",
				"priority": "critical" if org_health < 60 else "normal",
				"expected_impact": "+8-12% org health",
				"reasoning": "Automated cross-system diagnosis",
			},
			{
				"insight_id": "rec-002",
				"action": "Implement cross-team collaboration protocols" if cultural_factors["collaboration_index"] < 60 else "Scale collaboration patterns",
				"owner": "Head of People & Culture",
				"priority": "high" if cultural_factors["collaboration_index"] < 60 else "medium",
				"expected_impact": "+5-8% collaboration effectiveness",
				"reasoning": f"Collaboration index at {cultural_factors['collaboration_index']}%",
			},
		]

		risk_areas = [
			{
				"system": s,
				"risk_level": "critical" if latest_scores[s] < 30 else "moderate",
				"impact_radius": len([d for d in deps if d["system"] == s][0]["depends_on"]) if deps else 0,
				"mitigation_timeline": "30 days" if latest_scores[s] < 30 else "60 days",
			}
			for s in CANONICAL_SYSTEMS
			if latest_scores[s] < 45
		]
		opportunities = [
			{
				"system": s,
				"leverage_potential": "high",
				"suggested_action": f"Use {s} strength to boost interconnected systems",
				"roi_estimate": "3-5x investment",
			}
			for s in CANONICAL_SYSTEMS
			if latest_scores[s] > 70
		]

		transformation_score = int(round(
			cultural_factors["collaboration_index"] * 0.3
			+ cultural_factors["innovation_velocity"] * 0.25
			+ org_health * 0.35
			+ confidence * 100 * 0.1
		))

		return Response(
			{
				"org_id": org_id,
				"run_id": _make_run_id("DASH"),
				"date": _now_iso(),
				"org_health": org_health,
				"confidence": confidence,
				"north_star": {
					"name": "Increase on-time delivery by 15%",
					"value": f"{(org_health / 100 * 1.2):.2f}",
					"unit": "x",
					"trend": "improving" if org_health > 70 else "stable" if org_health > 50 else "needs_attention",
				},
				"systems": systems,
				"top_recommendations": recommendations,
				"organizational_insights": cultural_factors,
				"cross_system_dependencies": deps,
				"transformation_readiness": transformation_score,
				"health_forecast": {
					"next_30_days": min(100, org_health + (2 if confidence > 0.8 else -1)),
					"risk_areas": risk_areas,
					"improvement_opportunities": opportunities,
				},
				"framework_advantages": {
					"vs_erp": "Provides cultural and behavioral insights beyond transactional data",
					"vs_bi": "Automated organizational diagnosis vs manual dashboard building",
					"vs_consulting": "Continuous monitoring vs periodic assessments",
				},
			}
		)


class SimulateImpactView(APIView):
	permission_classes = [IsSuperuserOrTenantUser]

	def post(self, request):
		org = resolve_request_org(request)
		org_seed = str(org.id)
		system_key = normalize_system_key(request.data.get("system_key") or request.data.get("systemKey") or request.data.get("systemId"))
		try:
			change_pct = float(request.data.get("change_pct") or request.data.get("changePct") or 10)
		except (TypeError, ValueError):
			change_pct = 10.0

		latest_by_sys: Dict[str, int] = {}
		for r in AssessmentRun.objects.filter(organization=org).order_by("-timestamp_ms")[:500]:
			k = normalize_system_key(r.system_id)
			if k not in latest_by_sys:
				latest_by_sys[k] = int(r.score)

		system_scores = []
		for k in CANONICAL_SYSTEMS:
			score = latest_by_sys.get(k, 50)
			coverage = 1 if k in latest_by_sys else 0.5
			system_scores.append({"key": k, "score": score, "coverage": coverage})

		before = compute_org_health(system_scores)

		boosted = []
		for s in system_scores:
			if s["key"] == system_key:
				boosted.append({**s, "score": min(100, float(s["score"]) * (1 + change_pct / 100.0))})
			else:
				boosted.append(s)
		after = compute_org_health(boosted)

		return Response({"before": before, "after": after})


class UploadListCreateView(APIView):
	parser_classes = [MultiPartParser, FormParser, JSONParser]
	permission_classes = [IsSuperuserOrTenantUser]
	throttle_scope = "uploads"

	def get(self, request):
		org = resolve_request_org(request)
		qs = Upload.objects.all().order_by("-timestamp_ms")
		qs = qs.filter(organization=org)
		qs = qs[:200]
		return Response(UploadSerializer(qs, many=True, context={"request": request}).data)

	def post(self, request):
		org = resolve_request_org(request)

		name = str(request.data.get("name") or "")
		uploaded_file = request.FILES.get("file")
		if uploaded_file and not name:
			name = uploaded_file.name
		if not name:
			name = f"upload_{_now_ms()}"

		# Basic file protection controls (configure tighter in prod)
		max_bytes = int(getattr(settings, "MAX_UPLOAD_BYTES", 10 * 1024 * 1024))
		if uploaded_file and getattr(uploaded_file, "size", 0) and uploaded_file.size > max_bytes:
			return Response({"error": "file too large"}, status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)

		if uploaded_file:
			allowed_ext = {".csv", ".xlsx", ".txt", ".pdf", ".docx"}
			lower = uploaded_file.name.lower()
			ext = "." + lower.split(".")[-1] if "." in lower else ""
			if ext and ext not in allowed_ext:
				return Response({"error": "unsupported file type"}, status=status.HTTP_400_BAD_REQUEST)

		# attempt to extract small text for analysis
		text_sample = ""
		if uploaded_file:
			try:
				raw = uploaded_file.read(2048)
				uploaded_file.seek(0)
				text_sample = raw.decode("utf-8", errors="ignore")
			except Exception:
				text_sample = ""

		analyzed = analyze_filename_or_text(f"{name} {text_sample}")
		rec = Upload.objects.create(
			organization=org,
			name=name,
			file=uploaded_file,
			timestamp_ms=_now_ms(),
			analyzed_systems=analyzed,
			meta=request.data.get("meta") if isinstance(request.data.get("meta"), dict) else {},
			summary=f"Mock summary generated for {name}",
			analyzed_preview={"detected": analyzed, "confidence": 75},
		)
		return Response(UploadSerializer(rec, context={"request": request}).data, status=status.HTTP_201_CREATED)


class JobListView(APIView):
	permission_classes = [IsSuperuserOrTenantUser]

	def get(self, request):
		org = resolve_request_org(request)
		qs = Job.objects.all().order_by("-created_at")
		qs = qs.filter(organization=org)
		qs = qs[:200]
		return Response(JobSerializer(qs, many=True).data)


class JobDetailView(APIView):
	permission_classes = [IsSuperuserOrTenantUser]

	def get(self, request, job_id: str):
		org = resolve_request_org(request)
		try:
			job = Job.objects.get(id=job_id, organization=org)
		except Job.DoesNotExist:
			return Response({"error": "not found"}, status=status.HTTP_404_NOT_FOUND)
		return Response(JobSerializer(job).data)


class NotificationListView(APIView):
	permission_classes = [IsSuperuserOrTenantUser]

	def get(self, request):
		org = resolve_request_org(request)
		qs = Notification.objects.all().order_by("-timestamp_ms")
		qs = qs.filter(organization=org)
		qs = qs[:200]
		return Response(NotificationSerializer(qs, many=True).data)


# ═══════════════════════════════════════════════════════════
# SuperAdmin Analytics & Communication Endpoints
# ═══════════════════════════════════════════════════════════

class AdminPlatformAnalyticsView(APIView):
	"""Aggregate platform-level analytics for the SuperAdmin overview.

	Returns:
	- company_growth:  monthly new-company counts for last 12 months
	- user_growth:     monthly new-user counts for last 12 months
	- assessment_activity: monthly assessment counts for last 12 months
	- upload_activity: monthly upload counts for last 12 months
	- status_breakdown: active / suspended / banned org counts
	- tier_breakdown: free / premium counts
	- top_active_companies: top 10 by assessment+upload count
	"""
	permission_classes = [IsSuperAdmin]

	def get(self, request):
		from django.db.models import Count
		from django.db.models.functions import TruncMonth

		now = timezone.now()
		twelve_months_ago = now - timedelta(days=365)

		# Monthly growth — companies
		company_monthly = list(
			Organization.objects.filter(created_at__gte=twelve_months_ago)
			.annotate(month=TruncMonth("created_at"))
			.values("month")
			.annotate(count=Count("id"))
			.order_by("month")
		)

		# Monthly growth — users
		user_monthly = list(
			User.objects.filter(date_joined__gte=twelve_months_ago)
			.annotate(month=TruncMonth("date_joined"))
			.values("month")
			.annotate(count=Count("id"))
			.order_by("month")
		)

		# Monthly assessments
		assessment_monthly = list(
			AssessmentRun.objects.filter(created_at__gte=twelve_months_ago)
			.annotate(month=TruncMonth("created_at"))
			.values("month")
			.annotate(count=Count("id"))
			.order_by("month")
		)

		# Monthly uploads
		upload_monthly = list(
			Upload.objects.filter(created_at__gte=twelve_months_ago)
			.annotate(month=TruncMonth("created_at"))
			.values("month")
			.annotate(count=Count("id"))
			.order_by("month")
		)

		# Status breakdown
		status_breakdown = {}
		for s_val, s_label in Organization.Status.choices:
			status_breakdown[s_val] = Organization.objects.filter(status=s_val).count()

		# Tier breakdown
		tier_breakdown = {}
		for t_val, t_label in Organization.SubscriptionTier.choices:
			tier_breakdown[t_val] = Organization.objects.filter(subscription_tier=t_val).count()

		# Top 10 most active companies
		top_companies = []
		for org in Organization.objects.all()[:50]:
			assessments_count = AssessmentRun.objects.filter(organization=org).count()
			uploads_count = Upload.objects.filter(organization=org).count()
			users_count = UserProfile.objects.filter(organization=org).count()
			top_companies.append({
				"id": str(org.id),
				"name": org.name,
				"slug": org.slug,
				"status": org.status,
				"tier": org.subscription_tier,
				"assessments": assessments_count,
				"uploads": uploads_count,
				"users": users_count,
				"activity_score": assessments_count + uploads_count,
			})
		top_companies.sort(key=lambda x: x["activity_score"], reverse=True)
		top_companies = top_companies[:10]

		def serialize_monthly(qs):
			return [{"month": r["month"].strftime("%Y-%m"), "count": r["count"]} for r in qs]

		# Monthly visitor growth
		visitor_monthly = list(
			Visitor.objects.filter(created_at__gte=twelve_months_ago)
			.annotate(month=TruncMonth("created_at"))
			.values("month")
			.annotate(count=Count("id"))
			.order_by("month")
		)

		return Response({
			"company_growth": serialize_monthly(company_monthly),
			"user_growth": serialize_monthly(user_monthly),
			"assessment_activity": serialize_monthly(assessment_monthly),
			"upload_activity": serialize_monthly(upload_monthly),
			"visitor_growth": serialize_monthly(visitor_monthly),
			"status_breakdown": status_breakdown,
			"tier_breakdown": tier_breakdown,
			"top_active_companies": top_companies,
			"totals": {
				"companies": Organization.objects.count(),
				"users": User.objects.count(),
				"assessments": AssessmentRun.objects.count(),
				"uploads": Upload.objects.count(),
				"jobs": Job.objects.count(),
				"notifications": Notification.objects.count(),
				"visitors": Visitor.objects.count(),
				"visitor_assessments": sum(
					(v.assessment_count or 0) for v in Visitor.objects.only("assessment_count")
				),
			},
		})


class AdminSendNotificationView(APIView):
	"""Send a notification from the SuperAdmin to one or many companies.

	Body:
	- org_ids: list of org UUIDs  (or ["all"] for all active companies)
	- subject: string
	- body: string
	- channel: "internal" | "email"  (default: "internal")
	"""
	permission_classes = [IsSuperAdmin]

	def post(self, request):
		body = request.data if isinstance(request.data, dict) else {}
		org_ids = body.get("org_ids", [])
		subject = str(body.get("subject", "")).strip()
		msg_body = str(body.get("body", "")).strip()
		channel = str(body.get("channel", "internal")).strip().lower()

		if not subject:
			return Response({"error": "subject is required"}, status=status.HTTP_400_BAD_REQUEST)
		if not msg_body:
			return Response({"error": "body is required"}, status=status.HTTP_400_BAD_REQUEST)
		if channel not in ("internal", "email"):
			return Response({"error": "channel must be 'internal' or 'email'"}, status=status.HTTP_400_BAD_REQUEST)

		# Resolve target orgs
		if org_ids == ["all"] or org_ids == "all":
			target_orgs = list(Organization.objects.filter(status="active"))
		else:
			if not isinstance(org_ids, list) or len(org_ids) == 0:
				return Response({"error": "org_ids must be a non-empty list or 'all'"}, status=status.HTTP_400_BAD_REQUEST)
			target_orgs = list(Organization.objects.filter(id__in=org_ids))
			if not target_orgs:
				return Response({"error": "No matching organizations found"}, status=status.HTTP_404_NOT_FOUND)

		created = []
		ts = _now_ms()
		sender_email = request.user.email or request.user.username

		for org in target_orgs:
			# Find primary contact (first user in org)
			profile = UserProfile.objects.filter(organization=org).select_related("user").first()
			recipient = profile.user.email if profile else org.name

			notif = Notification.objects.create(
				organization=org,
				channel=channel,
				to=recipient,
				subject=subject,
				body=msg_body,
				meta={"sent_by": sender_email, "admin_notification": True},
				timestamp_ms=ts,
			)
			created.append(str(notif.id))

		return Response({
			"ok": True,
			"sent_count": len(created),
			"notification_ids": created,
		}, status=status.HTTP_201_CREATED)


# ──────────────────────────────────────────────
#  Visitor / Lead Capture
# ──────────────────────────────────────────────

class VisitorCaptureView(APIView):
	"""Public endpoint — captures visitor info when they start the assessment.
	If the email already exists, returns the existing visitor (upsert).
	No authentication required."""
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		import re
		data = request.data if isinstance(request.data, dict) else {}
		org_name = (data.get("organization_name") or "").strip()
		email = (data.get("email") or "").strip().lower()
		role = (data.get("role") or "").strip()
		name = (data.get("name") or "").strip()

		# ── Validation ──
		if not org_name:
			return Response({"error": "Organization name is required."}, status=status.HTTP_400_BAD_REQUEST)
		if not email:
			return Response({"error": "Email address is required."}, status=status.HTTP_400_BAD_REQUEST)
		if not re.match(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$', email):
			return Response({"error": "Please enter a valid email address."}, status=status.HTTP_400_BAD_REQUEST)

		ip = self._get_client_ip(request)
		ua = request.META.get("HTTP_USER_AGENT", "")

		# ── Upsert by email ──
		existing = Visitor.objects.filter(email=email).first()
		if existing:
			# Update org/role if changed
			if org_name and org_name != existing.organization_name:
				existing.organization_name = org_name
			if role and role != existing.role:
				existing.role = role
			if name and name != existing.name:
				existing.name = name
			existing.started_assessment = True
			existing.ip_address = ip
			existing.user_agent = ua[:1000]
			existing.save()

			return Response({
				"ok": True,
				"visitor_id": str(existing.id),
				"returning": True,
				"visitor": VisitorSerializer(existing).data,
			}, status=status.HTTP_200_OK)

		# ── Create new ──
		visitor = Visitor.objects.create(
			organization_name=org_name,
			name=name,
			role=role,
			email=email,
			started_assessment=True,
			ip_address=ip,
			user_agent=ua[:1000],
		)

		return Response({
			"ok": True,
			"visitor_id": str(visitor.id),
			"returning": False,
			"visitor": VisitorSerializer(visitor).data,
		}, status=status.HTTP_201_CREATED)

	@staticmethod
	def _get_client_ip(request):
		xff = request.META.get("HTTP_X_FORWARDED_FOR")
		if xff:
			return xff.split(",")[0].strip()
		return request.META.get("REMOTE_ADDR")


class VisitorSaveAssessmentView(APIView):
	"""Public endpoint — saves assessment results for a visitor."""
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		data = request.data if isinstance(request.data, dict) else {}
		visitor_id = (data.get("visitor_id") or "").strip()
		scores = data.get("scores", {})
		analysis_summary = (data.get("analysis_summary") or "").strip()
		systems_completed = data.get("systems_completed", [])

		if not visitor_id:
			return Response({"error": "visitor_id is required"}, status=status.HTTP_400_BAD_REQUEST)

		visitor = Visitor.objects.filter(id=visitor_id).first()
		if not visitor:
			return Response({"error": "Visitor not found"}, status=status.HTTP_404_NOT_FOUND)

		# Append to assessment_data history (keep last 50 assessments)
		history = visitor.assessment_data or []
		snapshot = {
			"date": timezone.now().isoformat(),
			"scores": scores,
			"analysis_summary": analysis_summary[:2000],
			"systems_completed": systems_completed,
		}
		history.append(snapshot)
		if len(history) > 50:
			history = history[-50:]

		visitor.assessment_data = history
		visitor.assessment_count = len(history)
		visitor.last_assessment_at = timezone.now()
		visitor.systems_attempted = list(set(visitor.systems_attempted or []) | set(systems_completed))
		visitor.save()

		return Response({"ok": True, "assessment_count": visitor.assessment_count})


class VisitorSaveChatView(APIView):
	"""Public endpoint — saves chat history for a visitor."""
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		data = request.data if isinstance(request.data, dict) else {}
		visitor_id = (data.get("visitor_id") or "").strip()
		messages = data.get("messages", [])

		if not visitor_id:
			return Response({"error": "visitor_id is required"}, status=status.HTTP_400_BAD_REQUEST)

		visitor = Visitor.objects.filter(id=visitor_id).first()
		if not visitor:
			return Response({"error": "Visitor not found"}, status=status.HTTP_404_NOT_FOUND)

		# Replace chat history (frontend sends the full list), keep last 200 messages
		if isinstance(messages, list):
			clean = []
			for m in messages[-200:]:
				if isinstance(m, dict):
					clean.append({
						"id": str(m.get("id", "")),
						"role": str(m.get("role", "user")),
						"text": str(m.get("text", ""))[:5000],
						"timestamp": str(m.get("timestamp", "")),
					})
			visitor.chat_history = clean
			visitor.save(update_fields=["chat_history", "updated_at"])

		return Response({"ok": True, "message_count": len(visitor.chat_history)})


class VisitorLookupView(APIView):
	"""Public endpoint — lookup visitor by email, returns full history."""
	permission_classes = [permissions.AllowAny]

	def get(self, request):
		email = (request.query_params.get("email") or "").strip().lower()
		if not email:
			return Response({"error": "email query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

		visitor = Visitor.objects.filter(email=email).first()
		if not visitor:
			return Response({"found": False}, status=status.HTTP_200_OK)

		return Response({
			"found": True,
			"visitor": VisitorSerializer(visitor).data,
		})


class VisitorSaveProgressView(APIView):
	"""Public endpoint — saves in-progress answers, step, and current system for a visitor."""
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		data = request.data if isinstance(request.data, dict) else {}
		visitor_id = (data.get("visitor_id") or "").strip()
		current_answers = data.get("current_answers")
		current_step = data.get("current_step")
		current_system_id = (data.get("current_system_id") or "").strip()

		if not visitor_id:
			return Response({"error": "visitor_id is required"}, status=status.HTTP_400_BAD_REQUEST)

		visitor = Visitor.objects.filter(id=visitor_id).first()
		if not visitor:
			return Response({"error": "Visitor not found"}, status=status.HTTP_404_NOT_FOUND)

		update_fields = ["updated_at"]

		if isinstance(current_answers, dict):
			visitor.current_answers = current_answers
			update_fields.append("current_answers")

		if current_step is not None:
			try:
				visitor.current_step = int(current_step)
				update_fields.append("current_step")
			except (ValueError, TypeError):
				pass

		if current_system_id is not None:
			visitor.current_system_id = current_system_id[:64]
			update_fields.append("current_system_id")

		visitor.save(update_fields=update_fields)

		return Response({"ok": True})


class AdminVisitorListView(APIView):
	"""SuperAdmin endpoint — lists all captured visitor leads."""
	permission_classes = [IsSuperAdmin]

	def get(self, request):
		qs = Visitor.objects.all()[:500]
		return Response(VisitorSerializer(qs, many=True).data)


class AdminVisitorUpdateView(APIView):
	"""SuperAdmin endpoint — update visitor status/notes."""
	permission_classes = [IsSuperAdmin]

	def patch(self, request, visitor_id):
		visitor = get_object_or_404(Visitor, id=visitor_id)
		data = request.data if isinstance(request.data, dict) else {}

		new_status = data.get("status")
		if new_status:
			valid = {c[0] for c in Visitor.Status.choices}
			if new_status not in valid:
				return Response(
					{"error": f"Invalid status. Must be one of: {', '.join(valid)}"},
					status=status.HTTP_400_BAD_REQUEST,
				)
			visitor.status = new_status

		notes = data.get("notes")
		if notes is not None:
			visitor.notes = notes

		visitor.save()
		return Response(VisitorSerializer(visitor).data)
