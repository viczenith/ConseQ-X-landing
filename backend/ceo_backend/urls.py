"""
URL configuration for ceo_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.shortcuts import redirect
from django.urls import include, path

from api.auth_views import ThrottledTokenObtainPairView, ThrottledTokenRefreshView


def root_view(_request):
    # This Django app is the API server. The Super Admin dashboard lives in the React frontend.
    # In local dev, redirect users who hit :8000/ to the React admin login.
    if getattr(settings, "DEBUG", False):
        frontend = getattr(settings, "FRONTEND_URL", None) or "http://localhost:3000"
        return redirect(f"{str(frontend).rstrip('/')}/admin/login")

    # Production fallback: keep a simple health-style payload.
    return JsonResponse(
        {
            "ok": True,
            "service": "ceo_backend",
            "hint": "API is under /api/. React app should serve the UI.",
        }
    )

urlpatterns = [
    path('', root_view, name='root'),
    path('admin/', admin.site.urls),

    # Auth
    path('api/auth/token/', ThrottledTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', ThrottledTokenRefreshView.as_view(), name='token_refresh'),

    # API (compat + versioned)
    path('api/', include('api.urls')),
    path('api/v1/', include('api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
