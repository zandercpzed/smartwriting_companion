#!/usr/bin/env bash
set -euo pipefail

REPO_FULL="zandercpzed/smartwriting_companion"
BACKUP_DIR="remote_backup_$(date +%Y%m%d_%H%M%S)"

echo "This script will BACKUP and then DELETE the remote repository: $REPO_FULL"
echo "A backup mirror and tarball will be created locally in $BACKUP_DIR"
read -p "Type YES to proceed with backup and deletion: " confirm
if [ "$confirm" != "YES" ]; then
  echo "Aborted by user."
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "Cloning mirror of remote..."
git clone --mirror "https://github.com/$REPO_FULL.git" "$BACKUP_DIR/mirror.git"

echo "Creating tarball..."
tar -czf "$BACKUP_DIR/mirror.git.tar.gz" -C "$BACKUP_DIR" "mirror.git"

echo "Backup created at $BACKUP_DIR/mirror.git.tar.gz"

read -p "Proceed to DELETE the remote repository? Type DELETE to confirm: " delconfirm
if [ "$delconfirm" != "DELETE" ]; then
  echo "Deletion aborted. Backup preserved."
  exit 0
fi

if command -v gh >/dev/null 2>&1; then
  echo "Using gh CLI to delete repository..."
  gh repo delete "$REPO_FULL" --confirm
  echo "Repository deleted using gh CLI."
  exit 0
fi

if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "gh CLI not found and GITHUB_TOKEN not set. Cannot delete repository automatically."
  echo "Set GITHUB_TOKEN environment variable or install GitHub CLI (gh) and retry."
  exit 1
fi

echo "Using GitHub API to delete repository..."
curl -s -X DELETE -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/repos/$REPO_FULL" -o /tmp/gh_delete_resp.json
jq . /tmp/gh_delete_resp.json || true
echo "Delete request sent. Check GitHub to confirm repository removal."
