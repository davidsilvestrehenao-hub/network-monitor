# GitHub Actions CI/CD Workflows

This directory contains automated workflows for continuous integration and deployment.

## Workflows

### 🔍 `ci.yml` - Main CI Pipeline
**Triggers:** Pull requests to main, pushes to main

**Jobs:**
- **quality-checks**: Prettier, ESLint, TypeScript type checking
- **test**: Run all test suites
- **build**: Build all packages and apps
- **security-scan**: Dependency audit
- **pr-summary**: Post results summary to PR

**Performance Optimizations:**
- ✅ Bun dependency caching (~2-3x faster installs)
- ✅ Turbo build caching (skip unchanged packages)
- ✅ Prisma client caching (avoid regeneration)
- ✅ Parallel job execution
- ✅ Shallow git fetch (fetch-depth: 2)

### 🤖 `pr-automation.yml` - PR Automation
**Triggers:** PR opened, synchronized, reopened

**Jobs:**
- **auto-label**: Auto-label PRs based on changed files
- **assign-gemini**: Trigger Gemini Code Assist review
- **size-label**: Label PR by size (xs/s/m/l/xl)

### ✅ `status-checks.yml` - PR Validation
**Triggers:** Pull requests to main

**Jobs:**
- **check-pr-title**: Validate semantic PR titles
- **check-branch-name**: Enforce branch naming convention
- **check-no-conflicts**: Detect merge conflicts
- **check-file-size**: Prevent large files
- **check-no-secrets**: Scan for leaked secrets

### 🔄 `auto-merge.yml` - Auto Merge
**Triggers:** PR updates, check suite completions

**Jobs:**
- **auto-merge**: Automatically squash merge PRs when all checks pass

**Safety Checks:**
- ✅ All CI checks must pass
- ✅ No merge conflicts
- ✅ PR must not be a draft
- ✅ Deletes merged branches automatically

## Performance Improvements

### Before Optimization
- **Install dependencies**: ~60s
- **Build Application**: ~90s
- **Total CI time**: ~3-4 minutes

### After Optimization (with cache)
- **Install dependencies**: ~5-10s (from cache)
- **Build Application**: ~20-30s (Turbo cache)
- **Total CI time**: ~45-60 seconds

**Expected speedup: 4-5x faster on subsequent runs!**

## Caching Strategy

### 1. Bun Dependencies Cache
```yaml
path: |
  ~/.bun/install/cache
  node_modules
key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lockb') }}
```
**Benefit**: Skip dependency installation if lockfile unchanged

### 2. Turbo Build Cache
```yaml
path: .turbo
key: ${{ runner.os }}-turbo-build-${{ github.sha }}
```
**Benefit**: Skip building unchanged packages (Turbo's incremental builds)

### 3. Prisma Client Cache
```yaml
path: node_modules/.prisma
key: ${{ runner.os }}-prisma-${{ hashFiles('packages/database/prisma/schema.prisma') }}
```
**Benefit**: Skip Prisma generation if schema unchanged

## Required Status Checks

These checks must pass before merging:

- ✅ Code formatting (Prettier)
- ✅ Linting (ESLint)
- ✅ Type checking (TypeScript)
- ✅ Build verification
- ✅ PR title validation
- ✅ Branch name validation
- ✅ No merge conflicts
- ✅ No secrets leaked

## Branch Naming Convention

Branches must follow this pattern:

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

## PR Title Convention

PR titles must follow semantic commit format:

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

## Labels

### Area Labels
- `area: frontend` - Frontend changes (apps/web)
- `area: api` - API changes (apps/api)
- `area: services` - Microservice changes
- `area: database` - Database/Prisma changes
- `area: infrastructure` - DI/container changes

### Type Labels
- `type: documentation` - Docs only
- `type: tests` - Test changes
- `type: configuration` - Config changes
- `type: dependencies` - Dependency updates
- `type: ci/cd` - CI/CD changes

### Size Labels
- `size/xs` - < 10 lines
- `size/s` - 10-100 lines
- `size/m` - 100-500 lines
- `size/l` - 500-1000 lines
- `size/xl` - > 1000 lines

## Gemini Code Assist

Gemini automatically reviews all PRs and checks:

- ✅ Architecture patterns (Router → Service → Repository)
- ✅ Dependency injection usage
- ✅ Event-driven communication
- ✅ TypeScript type safety
- ✅ Code quality standards
- ✅ 12-Factor App compliance
- ✅ Security vulnerabilities
- ✅ Performance issues
- ✅ Testing coverage

### Commands in PR comments:
```
/gemini review    # Trigger review
/gemini summary   # Get PR summary
/gemini help      # Show all commands

@gemini-code-assist <question>  # Ask questions
```

## Security

- **Gitleaks**: Scans for leaked secrets
- **Dependency Audit**: Checks for vulnerable dependencies
- **File Size Check**: Prevents large files
- **Branch Protection**: Enforces PR workflow

## Local Development

Run the same checks locally before pushing:

```bash
# Format code
bun run format

# Lint code
bun run lint:check

# Type check
bun run type-check

# Run tests
bun test

# Build
bun run build
```

## Troubleshooting

### CI failing on formatting
```bash
bun run format
git add .
git commit -m "style: Fix formatting"
git push
```

### CI failing on linting
```bash
bun run lint:fix
git add .
git commit -m "style: Fix linting"
git push
```

### CI failing on type errors
```bash
bun run type-check
# Fix type errors, then:
git add .
git commit -m "fix: Resolve type errors"
git push
```

### Branch name invalid
```bash
# Rename your branch
git branch -m feature/your-feature-name
git push origin feature/your-feature-name
```

### PR title invalid
Edit the PR title on GitHub to match semantic commit format.

### Cache Issues

If you suspect caching issues:

```bash
# Clear cache for a specific workflow run
gh workflow run ci.yml --ref main

# Or manually clear via GitHub Actions UI
# Settings → Actions → Caches → Delete specific cache
```

## Remote Caching (Optional)

For even faster builds, enable Turbo Remote Caching:

1. Sign up at https://vercel.com/
2. Get your Turbo token
3. Add as GitHub secrets:
   - `TURBO_TOKEN`: Your Vercel token
   - `TURBO_TEAM`: Your team name

This allows build cache sharing across all developers and CI runs!

## Adding New Workflows

1. Create `.github/workflows/<name>.yml`
2. Define triggers and jobs
3. Add caching for Bun dependencies
4. Update this README
5. Test on a feature branch
6. Update branch protection rules if needed
