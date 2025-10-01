# CI/CD Workflow & Pull Request Guidelines

## 🚨 CRITICAL: No Direct Commits to Main

**NEVER commit directly to the main branch.** All changes must go through Pull Requests.

### Branch Protection Enforcement

The repository has **three layers** of protection:

1. **Local pre-commit hook** - Blocks commits to main
2. **Local pre-push hook** - Blocks pushes to main
3. **GitHub branch protection** - Requires PRs and status checks

## 📋 Standard Development Workflow

### Step 1: Create Feature Branch

**Use the helper script:**
```bash
./scripts/new-feature.sh <feature-name>
```

**Or manually:**
```bash
git checkout main
git pull origin main
git checkout -b <type>/<description>
```

### Step 2: Make Changes

Work on your feature, following project architecture rules:
- Router → Service → Repository pattern
- Event-driven service communication
- Dependency injection
- TypeScript type safety (no `any` types)
- 12-Factor App compliance

### Step 3: Commit Changes

**Commit frequently with semantic commit messages:**
```bash
git add .
git commit -m "<type>: <description>"
```

### Step 4: Run Local CI Checks (Recommended)

**Before pushing, run local checks:**
```bash
./scripts/ci-check.sh
```

This runs:
- ✅ Prettier formatting check
- ✅ ESLint linting
- ✅ TypeScript type checking
- ✅ Build verification
- ✅ Tests (if applicable)

**Fix issues before pushing:**
```bash
bun run format              # Auto-fix formatting
bun run lint:fix            # Auto-fix linting
# Fix type errors manually
```

### Step 5: Push Feature Branch

```bash
git push origin <type>/<feature-name>
```

### Step 6: Create Pull Request

**Using GitHub CLI:**
```bash
gh pr create --fill
```

**Or via GitHub web interface:**
1. Navigate to repository on GitHub
2. Click "Compare & pull request"
3. Fill in PR details
4. Click "Create pull request"

### Step 7: Automated Review Process

**Immediately after PR creation:**

1. **GitHub Actions CI starts:**
   - Code Quality & Type Safety
   - Build Verification
   - Security Scan
   - PR Title Validation
   - Branch Name Validation
   - Merge Conflict Check
   - Secrets Scan

2. **PR Automation runs:**
   - Auto-labels based on changed files
   - Adds size label (xs/s/m/l/xl)
   - Triggers Gemini Code Assist
   - Posts welcome message

3. **Gemini Code Assist reviews (within 1 minute):**
   - Architecture compliance
   - Security vulnerabilities
   - Performance issues
   - Type safety
   - Code quality
   - Best practices
   - Testing coverage

### Step 8: Address Feedback

**If CI checks fail:**
1. Review the failed checks in PR
2. Fix issues locally
3. Commit and push fixes
4. CI re-runs automatically

**If Gemini suggests changes:**
1. Review the suggestions
2. Make necessary changes
3. Push updates
4. Comment `/gemini review` to trigger re-review

### Step 9: Merge PR

**Once all checks pass:**

```bash
# Squash and merge
gh pr merge --squash --delete-branch

# Or via GitHub web interface
```

## 🏷️ Branch Naming Convention

**Required format:**
```
<type>/<description>
```

**Valid types:**
- `feature/` - New features
- `fix/` - Bug fixes
- `hotfix/` - Critical production fixes
- `refactor/` - Code restructuring
- `docs/` - Documentation changes
- `test/` - Test improvements
- `chore/` - Maintenance tasks

**Examples:**
```bash
feature/add-user-authentication
fix/monitor-service-crash
refactor/clean-service-layer
docs/update-api-documentation
test/add-repository-tests
chore/update-dependencies
```

**Invalid examples:**
```bash
my-feature           # ❌ Missing type prefix
feature-name         # ❌ Wrong separator
add-feature          # ❌ Missing type prefix
```

## 📝 PR Title Convention

**Required format: Semantic Commit Style**

```
<type>: <description starting with capital letter>
```

**Valid types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style (formatting, semicolons, etc.)
- `refactor` - Code change that neither fixes bug nor adds feature
- `perf` - Performance improvement
- `test` - Adding or updating tests
- `build` - Build system or dependencies
- `ci` - CI/CD changes
- `chore` - Other changes (tooling, config, etc.)

**Examples:**
```
feat: Add user authentication system
fix: Resolve monitoring service crash on startup
refactor: Simplify service dependency injection
docs: Update API endpoint documentation
test: Add unit tests for TargetRepository
perf: Optimize database query performance
ci: Add automated security scanning
```

**Invalid examples:**
```
Add user authentication        # ❌ Missing type prefix
feat: add authentication       # ❌ Description not capitalized
added auth                     # ❌ Missing type and wrong format
```

## 🤖 Gemini Code Assist Commands

**Use in PR comments to interact with AI reviewer:**

### Trigger Review
```
/gemini review
```
Performs a complete code review of current PR state.

### Get Summary
```
/gemini summary
```
Generates a summary of PR changes.

### Ask Questions
```
@gemini-code-assist How should I refactor this service to follow the repository pattern?
```
Mention the bot to ask specific questions about code.

### Get Help
```
/gemini help
```
Shows all available commands.

## ✅ Required Status Checks

**These checks must pass before merging:**

1. ✅ **Code Quality & Type Safety**
   - Prettier formatting
   - ESLint linting
   - TypeScript type checking

2. ✅ **Build Application**
   - All packages build successfully

3. ✅ **Validate PR Title**
   - Follows semantic commit format

4. ✅ **Validate Branch Name**
   - Follows naming convention

5. ✅ **Check for Merge Conflicts**
   - No conflicts with main branch

6. ✅ **Scan for Secrets**
   - No leaked credentials or secrets

7. 🤖 **Gemini Code Assist**
   - AI code review completed

## 🏷️ Auto-Generated Labels

**PRs are automatically labeled based on files changed:**

### Area Labels
- `area: frontend` - Changes in `apps/web/`
- `area: api` - Changes in `apps/api/`
- `area: services` - Changes in service apps
- `area: database` - Changes in `packages/database/`
- `area: infrastructure` - Changes in `packages/infrastructure/`
- `area: monitoring` - Changes in `packages/monitor/`
- `area: alerting` - Changes in `packages/alerting/`
- `area: notifications` - Changes in `packages/notification/`
- `area: auth` - Changes in `packages/auth/`

### Type Labels
- `type: documentation` - Changes in `docs/` or `*.md` files
- `type: tests` - Changes in `*.test.ts` or `*.spec.ts` files
- `type: configuration` - Changes in config files
- `type: dependencies` - Changes in `package.json` or `bun.lock`
- `type: ci/cd` - Changes in `.github/workflows/`

### Size Labels
- `size/xs` - < 10 lines changed
- `size/s` - 10-100 lines changed
- `size/m` - 100-500 lines changed
- `size/l` - 500-1000 lines changed
- `size/xl` - > 1000 lines changed

## 🔧 Helper Scripts

### Create New Feature Branch
```bash
./scripts/new-feature.sh <name>
```
Creates a feature branch from latest main.

### Run CI Checks Locally
```bash
./scripts/ci-check.sh
```
Runs all CI checks that GitHub Actions will run.

## 🐛 Troubleshooting

### CI Failing: Formatting
```bash
bun run format
git add .
git commit -m "style: Fix formatting"
git push
```

### CI Failing: Linting
```bash
bun run lint:fix
git add .
git commit -m "style: Fix linting issues"
git push
```

### CI Failing: Type Errors
```bash
bun run type-check
# Fix type errors manually
git add .
git commit -m "fix: Resolve type errors"
git push
```

### CI Failing: Build
```bash
bun run build
# Fix build errors
git add .
git commit -m "fix: Resolve build errors"
git push
```

### Invalid Branch Name
```bash
# Rename your branch
git branch -m <type>/<description>
git push -u origin <type>/<description>

# Delete old branch on GitHub if needed
git push origin --delete old-branch-name
```

### Invalid PR Title
Edit the PR title on GitHub to match semantic commit format.

### Merge Conflicts
```bash
# Update your branch with main
git checkout main
git pull origin main
git checkout <your-branch>
git merge main

# Or use rebase
git rebase main

# Resolve conflicts, then:
git add .
git commit -m "chore: Resolve merge conflicts"
git push
```

## 📚 AI Agent Guidelines

**When helping users with PRs, always:**

1. ✅ **Remind them to create a feature branch first**
   - Never work directly on main
   - Use `./scripts/new-feature.sh`

2. ✅ **Follow semantic commit format**
   - Type prefix (feat, fix, etc.)
   - Capital letter description

3. ✅ **Run local CI checks before pushing**
   - Suggest running `./scripts/ci-check.sh`

4. ✅ **Explain CI failures clearly**
   - Point to specific errors
   - Provide fix commands

5. ✅ **Mention Gemini Code Assist**
   - AI will review automatically
   - Users can interact with `/gemini` commands

6. ✅ **Enforce architecture rules**
   - Router → Service → Repository
   - Event-driven communication
   - Dependency injection
   - Type safety

7. ✅ **Never suggest bypassing checks**
   - Don't use `--no-verify`
   - Don't use `--force`
   - Don't disable CI checks

## 🎯 Quick Reference

### Creating a PR (Full Workflow)
```bash
# 1. Create branch
./scripts/new-feature.sh my-feature

# 2. Make changes
# ... code changes ...

# 3. Commit
git add .
git commit -m "feat: Add new feature"

# 4. Check locally
./scripts/ci-check.sh

# 5. Push
git push origin feature/my-feature

# 6. Create PR
gh pr create --fill

# 7. Wait for reviews (automatic)
# - GitHub Actions CI
# - Gemini Code Assist

# 8. Address feedback if needed
# ... fix issues ...
git push  # Re-triggers CI

# 9. Merge when ready
gh pr merge --squash --delete-branch
```

### Quick Commands
```bash
# Format code
bun run format

# Check quality
bun run quality

# Fix auto-fixable issues
bun run quality:fix

# Run CI checks locally
./scripts/ci-check.sh

# Create PR
gh pr create --fill

# Merge PR
gh pr merge --squash --delete-branch
```

---

**Remember:** All code changes must go through PRs. The automated CI/CD pipeline ensures code quality, security, and architectural compliance. Gemini Code Assist provides AI-powered code reviews on every PR.

