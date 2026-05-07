#!/usr/bin/env bash
set -euo pipefail

npm run build

PORT="${PORT:-$((4300 + RANDOM % 1000))}"
export PORT
node scripts/pages-preview.mjs &
SERVER_PID="$!"

cleanup() {
  kill "$SERVER_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

sleep 1
npx playwright test --config=playwright.config.ts
