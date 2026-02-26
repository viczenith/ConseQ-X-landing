from __future__ import annotations

from typing import Optional

from rest_framework.exceptions import PermissionDenied

from .models import Organization
from .permissions import get_user_org


def resolve_request_org(request) -> Organization:
    """Resolve organization for this request.

    Rules:
    - Normal users: always use request.user.profile.organization
    - Superusers: may override with ?org_id=<uuid> for admin/debug
    """

    user = getattr(request, "user", None)
    if not user or not getattr(user, "is_authenticated", False):
        raise PermissionDenied("Authentication required")

    if getattr(user, "is_superuser", False):
        org_id = request.query_params.get("org_id")
        if org_id:
            try:
                return Organization.objects.get(id=org_id)
            except Organization.DoesNotExist:
                raise PermissionDenied("Invalid org_id")

    org = get_user_org(request)
    if not org:
        raise PermissionDenied("User is not assigned to an organization")
    return org
