#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-5174}"
ROOT="$(cd "$(dirname "$0")" && pwd)"

if command -v lsof >/dev/null 2>&1; then
  PIDS="$(lsof -ti ":${PORT}" 2>/dev/null || true)"
  if [[ -n "$PIDS" ]]; then
    echo "Stopping process(es) on port ${PORT}…"
    # shellcheck disable=SC2086
    kill -9 $PIDS 2>/dev/null || true
    sleep 0.5
  fi
fi

cd "$ROOT"
node scripts/run-migrations.mjs
exec npm exec next dev -- --port "$PORT"
