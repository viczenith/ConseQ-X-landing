from rest_framework import status as http_status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import UserProfile


class ThrottledTokenObtainPairView(TokenObtainPairView):
    """Custom token view that blocks suspended/banned users and orgs."""
    throttle_scope = "auth"

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        # If authentication succeeded, check governance status
        if response.status_code == 200:
            from django.contrib.auth.models import User
            username = request.data.get("username", "").strip()
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return response  # let the default 401 handle it

            # Check user profile status
            try:
                profile = user.profile
                if profile.status == "suspended":
                    return Response(
                        {"detail": "Your account has been suspended. Please contact support."},
                        status=http_status.HTTP_403_FORBIDDEN,
                    )
                if profile.status == "banned":
                    return Response(
                        {"detail": "Your account has been permanently banned."},
                        status=http_status.HTTP_403_FORBIDDEN,
                    )

                # Check org status (non-superadmin users only)
                if not user.is_superuser and profile.organization:
                    org = profile.organization
                    if org.status == "suspended":
                        return Response(
                            {"detail": "Your company has been suspended. Please contact your administrator."},
                            status=http_status.HTTP_403_FORBIDDEN,
                        )
                    if org.status == "banned":
                        return Response(
                            {"detail": "Your company has been permanently banned."},
                            status=http_status.HTTP_403_FORBIDDEN,
                        )
            except UserProfile.DoesNotExist:
                pass  # No profile yet, allow login

        return response


class ThrottledTokenRefreshView(TokenRefreshView):
    throttle_scope = "auth"
