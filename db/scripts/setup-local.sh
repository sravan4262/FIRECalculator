#!/usr/bin/env bash
# db/scripts/setup-local.sh
# Creates the local 'fire' database, applies the local migration, and seeds it.
# Usage:  npm run setup:local  (from repo root or db/)
#    or:  bash db/scripts/setup-local.sh

set -euo pipefail

DB_NAME="${DB_NAME:-firecalculator}"
PG_HOST="${PG_HOST:-localhost}"
PG_PORT="${PG_PORT:-54322}"
PG_USER="${PG_USER:-postgres}"
PG_PASS="${PG_PASS:-postgres}"
DB_URL="${DATABASE_URL:-postgresql://${PG_USER}:${PG_PASS}@${PG_HOST}:${PG_PORT}/${DB_NAME}}"
BASE_URL="postgresql://${PG_USER}:${PG_PASS}@${PG_HOST}:${PG_PORT}/postgres"
DEV_USER_ID="${DEV_USER_ID:-00000000-0000-0000-0000-000000000001}"

MIGRATIONS_DIR="$(dirname "$0")/../migrations"
SEEDS_DIR="$(dirname "$0")/../seeds"

echo "→ Ensuring database '${DB_NAME}' exists..."
psql "${BASE_URL}" -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" \
  | grep -q 1 && echo "  already exists." \
  || (psql "${BASE_URL}" -c "CREATE DATABASE \"${DB_NAME}\"" && echo "  created.")

echo "→ Applying local schema migration..."
psql "${DB_URL}" -f "${MIGRATIONS_DIR}/002_local.sql"

echo "→ Seeding dev user and tracker categories..."
psql "${DB_URL}" -v dev_user_id="${DEV_USER_ID}" -f "${SEEDS_DIR}/dev_seed_local.sql"

echo ""
echo "✓ Local DB ready."
echo "  DATABASE_URL=${DB_URL}"
echo "  DEV_USER_ID=${DEV_USER_ID}"
