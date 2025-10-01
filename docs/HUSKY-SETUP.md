# Husky Pre-commit Hooks Setup

This document describes the Husky pre-commit hooks configuration for the Network Monitor project.

## Overview

Husky is configured to run comprehensive CI checks locally before allowing commits and pushes. This ensures that code quality issues are caught early in the development process, rather than after pushing to CI.

## Setup

### Installation

Husky is already installed and configured in this project. The setup includes:

- **Husky v9.1.7** in `devDependencies`
- **Pre-commit hook** that runs all CI checks
- **Pre-push hook** that runs all CI checks before pushing
- **Modern Husky format** (no deprecated syntax)

### Configuration Files

#### `.husky/pre-commit`
```bash
echo "🔍 Running pre-commit checks..."

# Run our CI checks locally
./scripts/ci-check.sh

# Check if CI checks passed
if [ $? -ne 0 ]; then
    echo "❌ Pre-commit checks failed. Please fix the issues before committing."
    echo "💡 You can run './scripts/ci-check.sh' to see detailed error messages."
    exit 1
fi

echo "✅ All pre-commit checks passed!"
```

#### `.husky/pre-push`
```bash
echo "🚀 Running pre-push checks..."

# Run our CI checks locally before pushing
./scripts/ci-check.sh

# Check if CI checks passed
if [ $? -ne 0 ]; then
    echo "❌ Pre-push checks failed. Please fix the issues before pushing."
    echo "💡 You can run './scripts/ci-check.sh' to see detailed error messages."
    exit 1
fi

echo "✅ All pre-push checks passed! Ready to push."
```

## What Checks Are Run

The hooks run the same comprehensive checks as CI:

1. **Code Formatting (Prettier)** - Ensures consistent code style
2. **Linting (ESLint)** - Catches code quality issues and style violations
3. **Type Checking (TypeScript)** - Validates TypeScript compilation
4. **Build Verification** - Ensures all packages build successfully
5. **Tests** - Runs the test suite

## Developer Workflow

### Normal Development

1. Make your changes
2. Stage files with `git add`
3. Commit with `git commit` - **Husky will automatically run checks**
4. If checks fail, fix issues and commit again
5. Push with `git push` - **Husky will run checks again**

### When Checks Fail

If pre-commit checks fail:

1. **Read the error messages** - They'll tell you exactly what's wrong
2. **Fix the issues**:
   - Formatting: Run `bun run format`
   - Linting: Run `bun run lint:fix`
   - Type errors: Fix manually
   - Build errors: Check and fix
3. **Commit again** - Husky will re-run the checks

### Manual Check

You can manually run the same checks that Husky runs:

```bash
# Run all CI checks manually
./scripts/ci-check.sh

# Or run individual checks
bun run format:check
bun run lint:check
bun run type-check
bun run build
bun run test
```

## Bypassing Hooks (Not Recommended)

In emergency situations, you can bypass the hooks:

```bash
# Skip pre-commit hook (NOT RECOMMENDED)
git commit --no-verify -m "emergency fix"

# Skip pre-push hook (NOT RECOMMENDED)
git push --no-verify
```

**⚠️ Warning**: Bypassing hooks defeats the purpose of having them. Use only in true emergencies and fix issues immediately after.

## Benefits

### For Developers

- **Faster feedback** - Issues caught locally instead of waiting for CI
- **Better code quality** - Consistent formatting and style
- **Fewer CI failures** - Prevents broken builds from reaching CI
- **Time savings** - No need to wait for CI feedback cycles

### For the Project

- **Consistent code style** across all contributors
- **Reduced CI load** - Fewer failed builds
- **Better code quality** - Enforced standards
- **Faster reviews** - Clean, well-formatted code

## Troubleshooting

### Hook Not Running

If hooks aren't running:

1. **Check if Husky is installed**: `bun list husky`
2. **Verify hook files exist**: `ls -la .husky/`
3. **Check hook permissions**: `ls -la .husky/pre-commit`
4. **Reinstall hooks**: `bunx husky install`

### Performance Issues

If hooks are too slow:

1. **Use caching** - Turbo caches build results
2. **Run checks in parallel** - CI script already does this
3. **Consider staged checks** - Only check changed files (future enhancement)

### False Positives

If you get false positives:

1. **Check the specific error** - Usually indicates a real issue
2. **Update dependencies** - Sometimes fixes compatibility issues
3. **Report issues** - Create an issue if it's a tool problem

## Maintenance

### Updating Husky

To update Husky:

```bash
bun add -D husky@latest
bunx husky install
```

### Adding New Checks

To add new checks to the hooks:

1. **Update `scripts/ci-check.sh`** to include the new check
2. **Test locally** to ensure it works
3. **Update documentation** to reflect the new check

### Removing Checks

To remove checks:

1. **Update `scripts/ci-check.sh`** to remove the check
2. **Update documentation** to reflect the change
3. **Consider impact** on code quality

## Integration with CI

The Husky hooks run the exact same checks as CI:

- **Consistency** - Local and CI environments are identical
- **Reliability** - If it passes locally, it should pass in CI
- **Efficiency** - No surprises when pushing to CI

## Best Practices

1. **Always run hooks** - Don't bypass unless absolutely necessary
2. **Fix issues immediately** - Don't let them accumulate
3. **Keep dependencies updated** - Ensures compatibility
4. **Test hook changes** - Verify they work before committing
5. **Document changes** - Update this file when modifying hooks

## Future Enhancements

Potential improvements to consider:

1. **Staged file checks** - Only check changed files for faster feedback
2. **Parallel execution** - Run checks in parallel where possible
3. **Incremental builds** - Use build caching more effectively
4. **Custom hooks** - Add project-specific checks
5. **Hook configuration** - Make checks configurable per developer

---

**Remember**: The goal is to catch issues early and maintain high code quality. The hooks are your friend, not your enemy! 🎯
