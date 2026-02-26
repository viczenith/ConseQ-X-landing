from __future__ import annotations

from typing import Optional

from rest_framework import permissions

from .models import Organization


def get_user_org(request) -> Optional[Organization]:
    user = getattr(request, "user", None)
    if not user or not getattr(user, "is_authenticated", False):
        return None
    try:
        return user.profile.organization
    except Exception:
        return None


class IsTenantUser(permissions.BasePermission):
    """Requires an authenticated user associated to an Organization."""

    message = "User must belong to an organization."

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not user or not getattr(user, "is_authenticated", False):
            return False
        return get_user_org(request) is not None


class IsSuperuserOrTenantUser(permissions.BasePermission):
    """Allows superusers, or normal users that belong to an org."""

    message = "Not authorized."

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not user or not getattr(user, "is_authenticated", False):
            return False
        if getattr(user, "is_superuser", False):
            return True
        return get_user_org(request) is not None


class IsSuperAdmin(permissions.BasePermission):
    """Requires a Django superuser (SaaS Super Admin)."""

    message = "Super admin access required."

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not user or not getattr(user, "is_authenticated", False):
            return False
        return bool(getattr(user, "is_superuser", False))
