#!/bin/bash

# Run CI checks locally before pushing
# This mirrors what GitHub Actions will run

set -e

echo "🔍 Running local CI checks..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILED=0

# Function to run a check
run_check() {
  local name=$1
  local command=$2
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔹 $name"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  if eval "$command"; then
    echo -e "${GREEN}✅ $name passed${NC}"
  else
    echo -e "${RED}❌ $name failed${NC}"
    FAILED=$((FAILED + 1))
  fi
  echo ""
}

# Start checks
echo "Running checks that will run in CI..."
echo ""

# 1. Format check
run_check "Code Formatting (Prettier)" "bun run format:check"

# 2. Linting
run_check "Linting (ESLint)" "bun run lint:check"

# 3. Type checking
run_check "Type Checking (TypeScript)" "bun run type-check"

# 4. Build
run_check "Build Verification" "bun run build"

# 5. Tests (if test script exists)
if grep -q '"test"' package.json; then
  run_check "Tests" "bun test"
fi

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 CI Check Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed! Ready to push.${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. git push origin <your-branch>"
  echo "  2. Create a PR: gh pr create --fill"
  echo "  3. Wait for Gemini Code Assist review"
  echo ""
  exit 0
else
  echo -e "${RED}❌ $FAILED check(s) failed${NC}"
  echo ""
  echo "Please fix the issues before pushing:"
  echo ""
  echo "  • Format code: bun run format"
  echo "  • Fix linting: bun run lint:fix"
  echo "  • Fix type errors manually"
  echo "  • Check build errors"
  echo ""
  echo "Then run this script again: ./scripts/ci-check.sh"
  echo ""
  exit 1
fi

