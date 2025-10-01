#!/bin/bash
# Cleanup script to run after PR is merged
# Switches to main, pulls latest, and deletes the feature branch

set -e

# Get current branch name
CURRENT_BRANCH=$(git branch --show-current)

if [ "$CURRENT_BRANCH" = "main" ]; then
  echo "❌ Already on main branch"
  echo "Usage: Run this from your feature branch after PR is merged"
  exit 1
fi

echo "🔄 Switching to main branch..."
git checkout main

echo "⬇️  Pulling latest changes..."
git pull origin main

echo "🗑️  Deleting local branch: $CURRENT_BRANCH"
git branch -d "$CURRENT_BRANCH" || git branch -D "$CURRENT_BRANCH"

echo "✅ Cleanup complete!"
echo ""
echo "📊 Current status:"
git status

