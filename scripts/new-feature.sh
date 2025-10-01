#!/bin/bash

# Helper script to create a new feature branch

if [ -z "$1" ]; then
  echo "Usage: ./scripts/new-feature.sh <feature-name>"
  echo ""
  echo "Example:"
  echo "  ./scripts/new-feature.sh add-user-authentication"
  echo "  ./scripts/new-feature.sh fix-monitoring-bug"
  echo ""
  exit 1
fi

FEATURE_NAME=$1
BRANCH_NAME="feature/${FEATURE_NAME}"

# Ensure we're on main and up to date
echo "📥 Fetching latest changes..."
git fetch origin

echo "🔄 Switching to main branch..."
git checkout main

echo "⬇️  Pulling latest changes..."
git pull origin main

echo "🌿 Creating feature branch: ${BRANCH_NAME}"
git checkout -b "${BRANCH_NAME}"

echo ""
echo "✅ Feature branch created successfully!"
echo ""
echo "Next steps:"
echo "  1. Make your changes"
echo "  2. Commit: git add . && git commit -m 'Your message'"
echo "  3. Run CI checks locally: ./scripts/ci-check.sh"
echo "  4. Push: git push origin ${BRANCH_NAME}"
echo "  5. Create a Pull Request: gh pr create --fill"
echo ""
echo "Your PR will be automatically reviewed by:"
echo "  • GitHub Actions CI (formatting, linting, type checking, build)"
echo "  • Gemini Code Assist (architecture, security, best practices)"
echo ""

