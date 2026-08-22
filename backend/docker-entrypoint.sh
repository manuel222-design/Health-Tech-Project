#!/bin/sh
set -e

echo "=============================================="
echo "Waiting for database and applying migrations"
echo "=============================================="

alembic upgrade head

echo "=============================================="
echo "Starting TaifaCare backend"
echo "=============================================="

exec uvicorn main:app --host 0.0.0.0 --port 8000
