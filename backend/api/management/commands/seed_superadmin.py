"""
One-time management command to ensure the platform super-admin exists.

Usage:
    python manage.py seed_superadmin

Safe to run multiple times — uses get_or_create + set_password.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

EMAIL = "superadmin@conseq-x.com"
PASSWORD = "ConseQXAdmin2025!"


class Command(BaseCommand):
    help = "Create (or reset) the platform super-admin account."

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            username=EMAIL,
            defaults={"email": EMAIL},
        )
        user.email = EMAIL
        user.is_active = True
        user.is_staff = True
        user.is_superuser = True
        user.set_password(PASSWORD)
        user.save()

        verb = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(
            f"{verb} superadmin: {EMAIL}  (is_superuser={user.is_superuser})"
        ))
