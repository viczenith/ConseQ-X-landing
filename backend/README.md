# Django Backend (ceo-assessment-app)

This folder contains a Django + Django REST Framework backend that mirrors the mock endpoints used by the React app.

## Quick start (Windows / PowerShell)

From the repo root:

1. Create environment file
   - Copy `backend/.env.example` to `backend/.env`

2. Run migrations

   - `& "./.venv/Scripts/python.exe" backend/manage.py migrate`

3. Create admin (optional)

   - `& "./.venv/Scripts/python.exe" backend/manage.py createsuperuser`

4. Start the API server

   - `& "./.venv/Scripts/python.exe" backend/manage.py runserver 8000`

## Endpoints

### Compatibility (existing mock server)

- `GET /api/overview`
- `POST /api/enqueue`

These endpoints now require authentication and are tenant-scoped.

### Core

- `GET /api/health`
- `POST /api/auth/register`
- `GET /api/auth/me` (JWT or session)
- `POST /api/auth/token` (JWT)
- `POST /api/auth/token/refresh` (JWT)

- `POST /api/assessments/run`
- `GET /api/dashboard/summary?org_id=...`
- `POST /api/dashboard/simulate-impact`

- `GET /api/uploads`
- `POST /api/uploads` (multipart `file` upload)

- `GET /api/jobs`
- `GET /api/jobs/<job_id>`

- `GET /api/notifications`

## Processing queued jobs

The enqueue endpoint creates a `Job` row (pending). To process pending jobs and generate scores/notifications:

- `& "./.venv/Scripts/python.exe" backend/manage.py process_jobs --limit 10 --sleep 1`

## Tenancy & data protection

See [backend/TENANCY_AND_DATA_PROTECTION.md](backend/TENANCY_AND_DATA_PROTECTION.md)
