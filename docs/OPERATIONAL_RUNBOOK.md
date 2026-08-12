# Health-Tech Knowledge Management System

## Operational Runbook

### 1. Purpose

This runbook provides procedures for operating, monitoring, troubleshooting, recovering, and maintaining the Health-Tech Knowledge Management System in development and production environments.

### 2. System Components

| Component | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI + Python |
| Database | PostgreSQL |
| Authentication | JWT + bcrypt |
| AI Service | Groq API |
| Containers | Docker + Docker Compose |
| Production Platform | Render |

### 3. Health Check

The backend exposes a health endpoint:

```text
GET /health
