# Scripts Directory

This directory contains essential utility scripts for the Network Monitor project.

## 🚀 Development Scripts

### `ci-check.sh`

Runs local CI checks (formatting, linting, type checking, build) before pushing code.

**Usage:**

```bash
./scripts/ci-check.sh
```

**What it checks:**

- Code formatting (Prettier)
- Linting (ESLint)
- Type checking (TypeScript)
- Build verification
- Tests (if available)

**Referenced in:** `package.json` pre-commit and pre-push hooks

---

### `new-feature.sh`

Creates a new feature branch for development following Git Flow conventions.

**Usage:**

```bash
./scripts/new-feature.sh <feature-name>

# Examples:
./scripts/new-feature.sh add-user-authentication
./scripts/new-feature.sh fix-monitoring-bug
```

**What it does:**

- Fetches latest changes from origin
- Switches to main branch
- Pulls latest changes
- Creates new feature branch: `feature/<feature-name>`

---

## 🗄️ Database Scripts

### `start-dev-db.sh`

Manages the PostgreSQL development database using Docker Compose.

**Usage:**

```bash
# Start the database
./scripts/start-dev-db.sh
# or
bun run db:start

# View database logs
./scripts/start-dev-db.sh logs

# Stop the database
./scripts/start-dev-db.sh stop
# or
bun run db:stop

# Reset the database (removes all data)
./scripts/start-dev-db.sh reset
# or
bun run db:reset

# Check database status
./scripts/start-dev-db.sh status
# or
bun run db:status
```

**Database Connection Details:**

- Host: `localhost:5432`
- User: `dev`
- Password: `dev`
- Database: `network_monitor_dev`
- Connection String: `postgresql://dev:dev@localhost:5432/network_monitor_dev`

**Referenced in:** `package.json` as `db:start`, `db:stop`, `db:reset`, `db:status`

---

### `reset-database.ts`

Resets the database with fresh seed data.

**Usage:**

```bash
bun run scripts/reset-database.ts
```

**What it does:**

- Resets the database using `bun run push`
- Seeds with fresh data using `bun run seed`
- Provides confirmation and next steps

---

## 🚀 Production Scripts

### `deploy.sh`

Deployment script for production environments supporting both PM2 and systemd.

**Usage:**

```bash
# Deploy with PM2
./scripts/deploy.sh deploy-pm2

# Deploy with systemd
./scripts/deploy.sh deploy-systemd

# Build only
./scripts/deploy.sh build

# Install dependencies only
./scripts/deploy.sh install-deps

# Setup database only
./scripts/deploy.sh setup-db

# Check deployment status
./scripts/deploy.sh status

# View logs
./scripts/deploy.sh logs

# Restart application
./scripts/deploy.sh restart

# Stop application
./scripts/deploy.sh stop

# Uninstall application
./scripts/deploy.sh uninstall
```

**Options:**

- `--env=ENV` - Set environment (production, staging, development)
- `--port=PORT` - Set port number
- `--user=USER` - Set service user
- `--dir=DIR` - Set application directory

---

### `network-monitor.service`

Systemd service file for production deployment.

**Features:**

- Automatic startup and restart
- Security hardening
- Resource limits
- Logging to journal
- Proper user isolation

**Location:** `/etc/systemd/system/network-monitor.service` (when deployed)

---

## 🔧 Template Scripts

### `extract-template.sh`

Extracts this project as a template for creating new projects.

**Usage:**

```bash
./scripts/extract-template.sh <new-project-name>

# Example:
./scripts/extract-template.sh my-ecommerce-app
```

**What it does:**

- Creates a copy of the project in `../<new-project-name>`
- Removes template-specific files
- Initializes new git repository
- Updates package.json and app.config.ts
- Creates domain-specific structure
- Generates new README.md

**Output:** New project directory ready for customization

---

## 🛠️ Development Workflow

### 1. Start Development Environment

```bash
# Start database
bun run db:start

# Start development server
bun run dev
```

### 2. Create New Feature

```bash
./scripts/new-feature.sh add-user-auth
```

### 3. Run Local Checks

```bash
./scripts/ci-check.sh
```

### 4. Deploy to Production

```bash
./scripts/deploy.sh deploy-pm2
```

---

## 📋 Prerequisites

- **Docker and Docker Compose** - For database operations
- **Bun** - Package manager and runtime
- **Git** - Version control
- **PM2** (optional) - For PM2 deployment method

---

## 📝 Notes

- All scripts are designed to be run from the project root directory
- Database scripts use the `docker-compose.dev.yml` file
- Scripts include colored output for better readability
- Error handling and validation are included in all scripts
- Scripts follow the project's coding standards and architecture patterns

---

## 🔄 Template Usage

This project serves as a template for other applications. When extracting as a template:

1. Use `./scripts/extract-template.sh <project-name>`
2. Follow the generated README.md instructions
3. Customize domain requirements and database schema
4. Update code references throughout the codebase

See `docs/TEMPLATE-EXTRACTION-GUIDE.md` for detailed instructions.
