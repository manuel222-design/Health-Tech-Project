#!/bin/bash

set -e

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Load environment variables from backend/.env
ENV_FILE="$PROJECT_ROOT/backend/.env"

if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
else
    echo "ERROR: $ENV_FILE not found."
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL is not set."
    exit 1
fi

BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/healthtech_$TIMESTAMP.dump"

mkdir -p "$BACKUP_DIR"

echo "Starting database backup..."

pg_dump "$DATABASE_URL" -Fc -f "$BACKUP_FILE"

echo "Backup completed:"
echo "$BACKUP_FILE"

# Keep only the 7 most recent backups
ls -1t "$BACKUP_DIR"/*.dump 2>/dev/null | tail -n +8 | xargs -r rm --

echo "Backup retention cleanup completed."
