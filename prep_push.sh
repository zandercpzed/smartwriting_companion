#!/bin/bash
set -euo pipefail

REMOTE_URL="https://github.com/zandercpzed/smartwriting_companion.git"
echo "This script will replace the contents of the remote repository at $REMOTE_URL with your local repository."
read -p "Are you sure? Type YES to continue: " yn
if [ "$yn" != "YES" ]; then
  echo "Aborted."
  exit 1
fi

# Ensure clean working tree
git add -A
git commit -m "chore: prepare project for initial upload" || true

# Force push to remote main branch (creates branch if needed)
git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE_URL"
git push --force origin HEAD:main

echo "Push complete. Remote main branch replaced with local HEAD."
