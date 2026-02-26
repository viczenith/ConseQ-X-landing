import random
import time

from django.core.management.base import BaseCommand

from api.models import AssessmentRun, Job, Notification
from api.domain import CANONICAL_SYSTEMS, normalize_system_key


class Command(BaseCommand):
    help = "Process pending jobs (mock worker), producing scores and notifications."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=5)
        parser.add_argument("--sleep", type=float, default=0.0)

    def handle(self, *args, **options):
        limit = int(options["limit"])
        sleep_s = float(options["sleep"])

        pending = list(Job.objects.filter(status=Job.Status.PENDING).order_by("created_at")[:limit])
        if not pending:
            self.stdout.write("No pending jobs")
            return

        for job in pending:
            self.stdout.write(f"Processing job {job.id}")
            if sleep_s:
                time.sleep(sleep_s)

            try:
                system_id = normalize_system_key(job.system_id or job.payload.get("system") or job.payload.get("systemId"))
                if system_id not in CANONICAL_SYSTEMS:
                    system_id = ""

                score = max(10, min(99, int(40 + random.random() * 50)))
                result = {
                    "jobId": str(job.id),
                    "status": "completed",
                    "timestamp": int(time.time() * 1000),
                    "orgId": str(job.organization_id) if job.organization_id else None,
                    "system": system_id or None,
                    "score": score,
                    "summary": f"Auto-generated analysis for {job.name or 'upload'}",
                }

                job.status = Job.Status.COMPLETED
                job.result = result
                job.error = ""
                job.save(update_fields=["status", "result", "error", "updated_at"])

                if job.organization_id and system_id:
                    AssessmentRun.objects.create(
                        organization=job.organization,
                        system_id=system_id,
                        title=f"{system_id.title()} Assessment",
                        score=score,
                        coverage=1.0,
                        timestamp_ms=result["timestamp"],
                        meta={"job": str(job.id), "source": "process_jobs"},
                    )

                Notification.objects.create(
                    organization=job.organization,
                    channel=Notification.Channel.EMAIL if job.notify_to else Notification.Channel.INTERNAL,
                    to=job.notify_to or "",
                    subject=f"Analysis ready for {job.name or system_id or 'your upload'}",
                    body=f"Your analysis is ready. Score: {score}%\n\nSummary: {result['summary']}",
                    timestamp_ms=result["timestamp"],
                    meta={"jobId": str(job.id)},
                )

                self.stdout.write(f"Completed job {job.id}")
            except Exception as exc:
                job.status = Job.Status.FAILED
                job.error = str(exc)
                job.save(update_fields=["status", "error", "updated_at"])
                self.stderr.write(f"Job {job.id} failed: {exc}")
