from django.urls import path

from . import views

urlpatterns = [
    # Compatibility endpoints used by the existing mock server
    path("overview", views.OverviewView.as_view(), name="overview"),
    path("enqueue", views.EnqueueJobView.as_view(), name="enqueue"),

    # Core API
    path("health", views.HealthView.as_view(), name="health"),
    path("auth/register", views.RegisterView.as_view(), name="register"),
    path("auth/me", views.MeView.as_view(), name="me"),
    path("auth/change-password", views.ChangePasswordView.as_view(), name="change_password"),
    path("auth/change-password/", views.ChangePasswordView.as_view(), name="change_password_slash"),
    path("auth/demo-bootstrap-superadmin", views.DemoBootstrapSuperAdminView.as_view(), name="demo_bootstrap_superadmin"),
    path("auth/demo-bootstrap-superadmin/", views.DemoBootstrapSuperAdminView.as_view(), name="demo_bootstrap_superadmin_slash"),
    path("auth/upgrade", views.SelfUpgradeView.as_view(), name="self_upgrade"),
    path("auth/upgrade/", views.SelfUpgradeView.as_view(), name="self_upgrade_slash"),

    path("orgs", views.OrganizationListCreateView.as_view(), name="org_list"),
    path("orgs/<uuid:org_id>", views.OrganizationDetailView.as_view(), name="org_detail"),

    # Admin management
    path("admin/orgs/<uuid:org_id>/stats", views.AdminOrgStatsView.as_view(), name="admin_org_stats"),
    path("admin/orgs/<uuid:org_id>/uploads", views.AdminOrgUploadsView.as_view(), name="admin_org_uploads"),
    path("admin/orgs/<uuid:org_id>/assessments", views.AdminOrgAssessmentsView.as_view(), name="admin_org_assessments"),
    path("admin/orgs/<uuid:org_id>/jobs", views.AdminOrgJobsView.as_view(), name="admin_org_jobs"),
    path("admin/orgs/<uuid:org_id>/notifications", views.AdminOrgNotificationsView.as_view(), name="admin_org_notifications"),
    path("admin/users", views.AdminUserListView.as_view(), name="admin_users"),
    path("admin/users/<int:user_id>", views.AdminUserUpdateView.as_view(), name="admin_user_update"),
    path("admin/analytics", views.AdminPlatformAnalyticsView.as_view(), name="admin_analytics"),
    path("admin/send-notification", views.AdminSendNotificationView.as_view(), name="admin_send_notification"),

    path("assessments/run", views.RunAssessmentView.as_view(), name="run_assessment"),
    path("dashboard/summary", views.DashboardSummaryView.as_view(), name="dashboard_summary"),
    path("dashboard/simulate-impact", views.SimulateImpactView.as_view(), name="simulate_impact"),

    path("uploads", views.UploadListCreateView.as_view(), name="uploads"),

    path("jobs", views.JobListView.as_view(), name="jobs"),
    path("jobs/<str:job_id>", views.JobDetailView.as_view(), name="job_detail"),

    path("notifications", views.NotificationListView.as_view(), name="notifications"),

    # Visitor / Lead capture
    path("visitors/capture", views.VisitorCaptureView.as_view(), name="visitor_capture"),
    path("visitors/capture/", views.VisitorCaptureView.as_view(), name="visitor_capture_slash"),
    path("visitors/save-assessment", views.VisitorSaveAssessmentView.as_view(), name="visitor_save_assessment"),
    path("visitors/save-assessment/", views.VisitorSaveAssessmentView.as_view(), name="visitor_save_assessment_slash"),
    path("visitors/save-chat", views.VisitorSaveChatView.as_view(), name="visitor_save_chat"),
    path("visitors/save-chat/", views.VisitorSaveChatView.as_view(), name="visitor_save_chat_slash"),
    path("visitors/lookup", views.VisitorLookupView.as_view(), name="visitor_lookup"),
    path("visitors/lookup/", views.VisitorLookupView.as_view(), name="visitor_lookup_slash"),
    path("admin/visitors", views.AdminVisitorListView.as_view(), name="admin_visitors"),
    path("admin/visitors/<uuid:visitor_id>", views.AdminVisitorUpdateView.as_view(), name="admin_visitor_update"),
]
