# Scripts Directory

This directory contains utility scripts for the Network Monitor project.

## Database Scripts

### `start-dev-db.sh`

Starts the PostgreSQL development database using Docker Compose.

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

## Other Scripts

### `new-feature.sh`

Creates a new feature branch for development.

**Usage:**

```bash
./scripts/new-feature.sh <feature-name>
```

### `ci-check.sh`

Runs local CI checks (formatting, linting, type checking, build).

**Usage:**

```bash
./scripts/ci-check.sh
```

### `deploy.sh`

Deployment script for production.

**Usage:**

```bash
./scripts/deploy.sh
```

## Development Workflow

1. **Start Development Environment:**

   ```bash
   # Start database
   bun run db:start
   
   # Start development server
   bun run dev
   ```

2. **Create New Feature:**

   ```bash
   ./scripts/new-feature.sh add-user-auth
   ```

3. **Run Local Checks:**

   ```bash
   ./scripts/ci-check.sh
   ```

4. **Deploy:**

   ```bash
   ./scripts/deploy.sh
   ```

## Prerequisites

- Docker and Docker Compose must be installed and running
- Bun package manager
- Git

## Notes

- All scripts are designed to be run from the project root directory
- Database scripts use the `docker-compose.dev.yml` file
- Scripts include colored output for better readability
- Error handling and validation are included in all scripts
