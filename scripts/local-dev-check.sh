#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/3] TypeScript typecheck"
npm run typecheck

echo "[2/3] Expo doctor (best effort)"
if npm run doctor; then
  echo "Expo doctor OK"
else
  echo "[WARN] Expo doctor non disponibile in questo ambiente (proseguo con gli altri check)"
fi

echo "[3/3] Python automation smoke (best effort)"
if command -v python3 >/dev/null 2>&1; then
  python3 -m py_compile automation/*.py && echo "Python smoke OK"
else
  echo "[WARN] python3 non disponibile: smoke python saltato"
fi

echo "Local checks completati"
