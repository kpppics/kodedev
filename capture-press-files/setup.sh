#!/usr/bin/env bash
# One-shot installer: copies Capture Press files into kpppics/capture-press repo.
# Usage:
#   GH_TOKEN=ghp_xxxxx bash setup.sh
# or:
#   curl -sL https://raw.githubusercontent.com/kpppics/kodedev/cp-staging/capture-press-files/setup.sh | GH_TOKEN=ghp_xxx bash

set -euo pipefail

if [ -z "${GH_TOKEN:-}" ]; then
  echo "ERROR: GH_TOKEN env var not set."
  echo "Create a token at: https://github.com/settings/tokens/new?scopes=repo&description=capture-press"
  echo "Then run: GH_TOKEN=ghp_xxx bash setup.sh"
  exit 1
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "==> Cloning staging branch from kodedev..."
git clone --depth 1 -b cp-staging https://github.com/kpppics/kodedev.git "$TMP/src"

echo "==> Preparing capture-press directory..."
cd "$TMP/src/capture-press-files"
rm -f setup.sh
rm -rf .git

echo "==> Initializing fresh repo..."
git init -q -b main
git config user.email "setup@capturepress.local"
git config user.name "Capture Press Setup"
git add .
git commit -q -m "feat: initial Capture Press app"

echo "==> Pushing to kpppics/capture-press..."
git remote add origin "https://x-access-token:${GH_TOKEN}@github.com/kpppics/capture-press.git"
git push -u origin main

echo ""
echo "DONE. Code is now at https://github.com/kpppics/capture-press"
echo "Next: go to https://vercel.com/new and import kpppics/capture-press"
