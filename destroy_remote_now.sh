#!/usr/bin/env bash
set -euo pipefail

# WARNING: This script will DELETE the remote repository irreversibly.
# It performs NO BACKUP. Use only if you understand the consequences.

REPO_FULL="zandercpzed/smartwriting_companion"

if [ "${CONFIRM_DELETE:-}" != "YES" ]; then
  echo "CONFIRM_DELETE environment variable not set to YES. Aborting." >&2
  echo "To run: CONFIRM_DELETE=YES ./destroy_remote_now.sh" >&2
  exit 2
fi

echo "Deleting remote repository: $REPO_FULL"

if command -v gh >/dev/null 2>&1; then
  echo "Using gh CLI (authenticated user) to delete repository..."
  gh repo delete "$REPO_FULL" --confirm
  echo "Repository deleted via gh CLI."
  exit 0
fi

if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "Error: Neither gh CLI found nor GITHUB_TOKEN set. Cannot proceed." >&2
  echo "Install gh (https://cli.github.com/) and run 'gh auth login', or export GITHUB_TOKEN." >&2
  exit 1
fi

echo "Using GitHub API with GITHUB_TOKEN to delete repository..."
RESP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE -H "Authorization: token ${GITHUB_TOKEN}" "https://api.github.com/repos/${REPO_FULL}")
if [ "$RESP_CODE" = "204" ]; then
  echo "Repository deleted (204 No Content)."
else
  echo "Failed to delete repository. HTTP status: $RESP_CODE" >&2
  echo "Response body:" >&2
  curl -s -X DELETE -H "Authorization: token ${GITHUB_TOKEN}" "https://api.github.com/repos/${REPO_FULL}"
  exit 1
fi
