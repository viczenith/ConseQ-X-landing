import uuid

from django.conf import settings
from django.db import models


class Organization(models.Model):
	class SubscriptionTier(models.TextChoices):
		FREE = "free", "Free"
		PREMIUM = "premium", "Premium"

	class Status(models.TextChoices):
		ACTIVE = "active", "Active"
		SUSPENDED = "suspended", "Suspended"
		BANNED = "banned", "Banned"

	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	name = models.CharField(max_length=255)
	slug = models.SlugField(max_length=255, unique=True)

	subscription_tier = models.CharField(
		max_length=32,
		choices=SubscriptionTier.choices,
		default=SubscriptionTier.FREE,
	)
	subscription_expires_at = models.DateTimeField(null=True, blank=True)

	status = models.CharField(
		max_length=16,
		choices=Status.choices,
		default=Status.ACTIVE,
	)
	status_reason = models.TextField(blank=True, default="")
	status_changed_at = models.DateTimeField(null=True, blank=True)
	status_changed_by = models.CharField(max_length=255, blank=True, default="")

	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self) -> str:  # pragma: no cover
		return f"{self.name} ({self.slug})"


class UserProfile(models.Model):
	class Status(models.TextChoices):
		ACTIVE = "active", "Active"
		SUSPENDED = "suspended", "Suspended"
		BANNED = "banned", "Banned"

	user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
	organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True)
	phone = models.CharField(max_length=64, blank=True, default="")

	status = models.CharField(
		max_length=16,
		choices=Status.choices,
		default=Status.ACTIVE,
	)
	status_reason = models.TextField(blank=True, default="")
	status_changed_at = models.DateTimeField(null=True, blank=True)
	status_changed_by = models.CharField(max_length=255, blank=True, default="")

	def __str__(self) -> str:  # pragma: no cover
		return f"Profile({self.user_id})"


class Upload(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True)

	name = models.CharField(max_length=512)
	file = models.FileField(upload_to="uploads/", null=True, blank=True)

	timestamp_ms = models.BigIntegerField()
	analyzed_systems = models.JSONField(default=list)
	meta = models.JSONField(default=dict, blank=True)
	summary = models.TextField(blank=True, default="")
	analyzed_preview = models.JSONField(default=dict, blank=True)

	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self) -> str:  # pragma: no cover
		return f"Upload({self.name})"


class AssessmentRun(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True)

	system_id = models.CharField(max_length=64)
	title = models.CharField(max_length=255)

	score = models.PositiveIntegerField(default=0)
	coverage = models.FloatField(default=0.0)
	timestamp_ms = models.BigIntegerField()
	meta = models.JSONField(default=dict, blank=True)

	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		indexes = [
			models.Index(fields=["system_id", "timestamp_ms"]),
		]


class Job(models.Model):
	class Status(models.TextChoices):
		PENDING = "pending", "Pending"
		COMPLETED = "completed", "Completed"
		FAILED = "failed", "Failed"

	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True)

	name = models.CharField(max_length=512, blank=True, default="")
	system_id = models.CharField(max_length=64, blank=True, default="")
	notify_to = models.EmailField(blank=True, default="")

	status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
	payload = models.JSONField(default=dict, blank=True)
	result = models.JSONField(default=dict, blank=True)
	error = models.TextField(blank=True, default="")

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)


class Notification(models.Model):
	class Channel(models.TextChoices):
		EMAIL = "email", "Email"
		SMS = "sms", "SMS"
		INTERNAL = "internal", "Internal"

	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True)

	channel = models.CharField(max_length=16, choices=Channel.choices, default=Channel.INTERNAL)
	to = models.CharField(max_length=255, blank=True, default="")
	subject = models.CharField(max_length=255, blank=True, default="")
	body = models.TextField(blank=True, default="")
	meta = models.JSONField(default=dict, blank=True)
	timestamp_ms = models.BigIntegerField()

	created_at = models.DateTimeField(auto_now_add=True)

class Visitor(models.Model):
	"""Captures visitor/lead info from the public assessment page."""
	class Status(models.TextChoices):
		NEW = "new", "New"
		CONTACTED = "contacted", "Contacted"
		CONVERTED = "converted", "Converted"
		DISMISSED = "dismissed", "Dismissed"
		SUSPENDED = "suspended", "Suspended"
		BANNED = "banned", "Banned"

	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	organization_name = models.CharField(max_length=255)
	name = models.CharField(max_length=255, blank=True, default="")
	role = models.CharField(max_length=255, blank=True, default="")
	email = models.EmailField(db_index=True)

	status = models.CharField(
		max_length=16,
		choices=Status.choices,
		default=Status.NEW,
	)
	notes = models.TextField(blank=True, default="")
	started_assessment = models.BooleanField(default=False)
	systems_attempted = models.JSONField(default=list, blank=True)
	ip_address = models.GenericIPAddressField(null=True, blank=True)
	user_agent = models.TextField(blank=True, default="")

	# Persistent data
	assessment_count = models.PositiveIntegerField(default=0)
	assessment_data = models.JSONField(default=list, blank=True, help_text="List of past assessment snapshots [{date, scores, analysis_summary}]")
	chat_history = models.JSONField(default=list, blank=True, help_text="List of chat messages [{id, role, text, timestamp}]")
	last_assessment_at = models.DateTimeField(null=True, blank=True)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-created_at"]

	def __str__(self) -> str:  # pragma: no cover
		return f"Visitor({self.email} - {self.organization_name})"

# Create your models here.
