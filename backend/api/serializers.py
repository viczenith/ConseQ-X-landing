from django.contrib.auth.models import User
from rest_framework import serializers

from .models import AssessmentRun, Job, Notification, Organization, Upload, UserProfile, Visitor


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = [
            "id",
            "name",
            "slug",
            "subscription_tier",
            "subscription_expires_at",
            "status",
            "status_reason",
            "status_changed_at",
            "status_changed_by",
            "created_at",
        ]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "is_superuser",
            "is_active",
        ]


class RegisterSerializer(serializers.Serializer):
    org_name = serializers.CharField(max_length=255)
    ceo_name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=64)
    password = serializers.CharField(min_length=6, write_only=True)


class UploadSerializer(serializers.ModelSerializer):
    org_id = serializers.SerializerMethodField()

    class Meta:
        model = Upload
        fields = [
            "id",
            "org_id",
            "name",
            "file",
            "timestamp_ms",
            "analyzed_systems",
            "meta",
            "summary",
            "analyzed_preview",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_org_id(self, obj: Upload):
        return str(obj.organization_id) if obj.organization_id else None


class AssessmentRunSerializer(serializers.ModelSerializer):
    orgId = serializers.SerializerMethodField()
    systemId = serializers.CharField(source="system_id")

    class Meta:
        model = AssessmentRun
        fields = [
            "id",
            "systemId",
            "title",
            "score",
            "coverage",
            "timestamp_ms",
            "orgId",
            "meta",
        ]

    def get_orgId(self, obj: AssessmentRun):
        return str(obj.organization_id) if obj.organization_id else "anon"


class JobSerializer(serializers.ModelSerializer):
    jobId = serializers.SerializerMethodField()
    orgId = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            "jobId",
            "status",
            "orgId",
            "name",
            "system_id",
            "notify_to",
            "payload",
            "result",
            "error",
            "created_at",
            "updated_at",
        ]

    def get_jobId(self, obj: Job):
        return str(obj.id)

    def get_orgId(self, obj: Job):
        return str(obj.organization_id) if obj.organization_id else None


class NotificationSerializer(serializers.ModelSerializer):
    orgId = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id",
            "orgId",
            "channel",
            "to",
            "subject",
            "body",
            "meta",
            "timestamp_ms",
            "created_at",
        ]

    def get_orgId(self, obj: Notification):
        return str(obj.organization_id) if obj.organization_id else None


class AdminUserSerializer(serializers.ModelSerializer):
    orgId = serializers.SerializerMethodField()
    orgName = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    profile_status = serializers.SerializerMethodField()
    profile_status_reason = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "is_superuser",
            "is_active",
            "date_joined",
            "last_login",
            "orgId",
            "orgName",
            "phone",
            "profile_status",
            "profile_status_reason",
        ]

    def _profile(self, obj: User):
        try:
            return obj.profile
        except UserProfile.DoesNotExist:
            return None

    def get_orgId(self, obj: User):
        p = self._profile(obj)
        return str(p.organization_id) if p and p.organization_id else None

    def get_orgName(self, obj: User):
        p = self._profile(obj)
        return p.organization.name if p and p.organization_id else None

    def get_phone(self, obj: User):
        p = self._profile(obj)
        return p.phone if p else ""

    def get_profile_status(self, obj: User):
        p = self._profile(obj)
        return p.status if p else "active"

    def get_profile_status_reason(self, obj: User):
        p = self._profile(obj)
        return p.status_reason if p else ""


class VisitorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visitor
        fields = [
            "id",
            "organization_name",
            "name",
            "role",
            "email",
            "status",
            "notes",
            "started_assessment",
            "systems_attempted",
            "assessment_count",
            "assessment_data",
            "chat_history",
            "current_answers",
            "current_step",
            "current_system_id",
            "last_assessment_at",
            "ip_address",
            "user_agent",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
