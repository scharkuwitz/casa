#!/bin/sh
# Container entrypoint: validate config, apply committed migrations, then start the server.
set -eu

fail() {
  echo "[entrypoint] $*" >&2
  exit 1
}

# Standalone server.js chdirs into its own directory, so a relative SQLite path would point
# somewhere other than the volume.
case "${DATABASE_URL:-}" in
  file:/*) ;;
  *) fail "DATABASE_URL must be an absolute file: URL (e.g. file:/data/app.db), got '${DATABASE_URL:-}'" ;;
esac
[ -n "${BETTER_AUTH_SECRET:-}" ] || fail "BETTER_AUTH_SECRET is not set"
[ -n "${BETTER_AUTH_URL:-}" ] || fail "BETTER_AUTH_URL is not set"

mkdir -p "${UPLOAD_DIR:-/data/uploads}"

echo "[entrypoint] applying database migrations"
(cd /opt/prisma && node node_modules/prisma/build/index.js migrate deploy)

exec "$@"
