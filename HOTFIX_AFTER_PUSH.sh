#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: bash HOTFIX_AFTER_PUSH.sh YOUR_GITHUB_USERNAME"
  exit 1
fi

GH_USER="$1"

if [ ! -d .git ]; then
  echo "Run this script from inside your local realtime-agent-lab repository folder."
  exit 1
fi

cp README_FIXED.md README.md

# Replace accidental upstream-owner URLs that point to a repository the current maintainer does not control.
grep -RIl 'sohzm/realtime-agent-lab' src --include='*.js' --include='*.html' 2>/dev/null \
  | xargs -r sed -i "s#sohzm/realtime-agent-lab#${GH_USER}/realtime-agent-lab#g"

npm test
npm run check

git add README.md src
if ! git diff --cached --quiet; then
  git commit -m "docs: clarify project scope and maintainer links"
  git push origin main
fi

if ! git rev-parse v0.1.1 >/dev/null 2>&1; then
  git tag -a v0.1.1 -m "Realtime Agent Lab v0.1.1"
  git push origin v0.1.1
fi

if command -v gh >/dev/null 2>&1; then
  gh release view v0.1.1 >/dev/null 2>&1 || gh release create v0.1.1 --title "Realtime Agent Lab v0.1.1" --generate-notes
  gh issue create --title "Add OpenAI realtime provider adapter" --body "Implement and test a provider adapter for OpenAI realtime sessions using the provider-neutral session event model." >/dev/null 2>&1 || true
  gh issue create --title "Add Anthropic provider adapter fixtures" --body "Add public redacted fixtures and regression tests for Anthropic-backed agent workflows where supported." >/dev/null 2>&1 || true
  gh issue create --title "Threat-model Electron IPC and credential storage" --body "Document trust boundaries and add tests for IPC validation, local credential handling, native helpers, and external URL opening." >/dev/null 2>&1 || true
fi

echo "Done. Confirm GitHub Actions is green before submitting applications."
