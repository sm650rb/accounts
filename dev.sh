#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

PORT="${PORT:-5174}"
PHP="${PHP:-php}"

if ! command -v "$PHP" >/dev/null 2>&1; then
  if [[ -x /opt/homebrew/bin/php ]]; then
    PHP=/opt/homebrew/bin/php
  else
    echo "PHP is required. Install with: brew install php" >&2
    exit 1
  fi
fi

if [[ ! -d vendor ]] && command -v composer >/dev/null 2>&1; then
  echo "==> Installing PHP dependencies…"
  composer install --no-interaction
fi

if [[ "${SKIP_DB_MIGRATE:-}" != "1" ]]; then
  echo "==> Running migrations…"
  "$PHP" scripts/migrate.php || {
    echo "Migration failed (DB unreachable?). Start anyway with SKIP_DB_MIGRATE=1 ./dev.sh" >&2
    exit 1
  }
fi

echo "==> http://localhost:${PORT}  (Ctrl+C to stop)"
exec "$PHP" -S "localhost:${PORT}" -t public public/index.php
