from django.contrib import admin

from .models import AssessmentRun, Job, Notification, Organization, Upload, UserProfile, Visitor


admin.site.register(Organization)
admin.site.register(UserProfile)
admin.site.register(Upload)
admin.site.register(AssessmentRun)
admin.site.register(Job)
admin.site.register(Notification)
admin.site.register(Visitor)

# Register your models here.
