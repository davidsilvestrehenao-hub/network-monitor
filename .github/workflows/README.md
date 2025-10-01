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

## Required Status Checks

The following checks must pass before merging:

- ✅ Code formatting (Prettier)
- ✅ Linting (ESLint)
- ✅ Type checking (TypeScript)
- ✅ Build verification
- ✅ PR title format
- ✅ Branch name format
- ✅ No merge conflicts
- ✅ No secrets leaked
- 🤖 Gemini Code Assist review

## Branch Naming Convention

Branches must follow this pattern:

```
feature/<description>   # New features
fix/<description>       # Bug fixes
hotfix/<description>    # Critical fixes
refactor/<description>  # Code refactoring
docs/<description>      # Documentation
test/<description>      # Test improvements
chore/<description>     # Maintenance tasks
```

Examples:
- `feature/add-user-auth`
- `fix/monitor-crash`
- `refactor/clean-services`

Use the helper script:
```bash
./scripts/new-feature.sh add-user-auth
```

## PR Title Convention

PR titles must follow semantic commit format:

```
<type>: <description>

Types:
  feat:     New feature
  fix:      Bug fix
  docs:     Documentation changes
  style:    Code style (formatting, etc)
  refactor: Code refactoring
  perf:     Performance improvement
  test:     Add/update tests
  build:    Build system changes
  ci:       CI/CD changes
  chore:    Other changes
```

Examples:
- `feat: Add user authentication`
- `fix: Resolve monitoring crash`
- `refactor: Clean up service layer`

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
git commit --amend --no-edit
```

### CI failing on linting
```bash
bun run lint:check
# Fix issues manually, then:
git add .
git commit --amend --no-edit
```

### CI failing on type errors
```bash
bun run type-check
# Fix type errors, then:
git add .
git commit --amend --no-edit
```

### Branch name invalid
```bash
# Rename your branch
git branch -m feature/your-feature-name
git push origin feature/your-feature-name
```

### PR title invalid
Edit the PR title on GitHub to match semantic commit format.

## Adding New Workflows

1. Create `.github/workflows/<name>.yml`
2. Define triggers and jobs
3. Update this README
4. Test on a feature branch
5. Update branch protection rules if needed

