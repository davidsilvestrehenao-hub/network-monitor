# @network-monitor/database

Database package containing Prisma schema, client, and repository implementations.

## 📁 Structure

```
packages/database/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data script
├── src/
│   ├── repositories/    # Repository implementations (TODO)
│   └── index.ts         # Package exports
└── package.json
```

## 🚀 Commands

All database commands are run through Turborepo from the root:

```bash
# Generate Prisma Client
bun run db:generate

# Push schema to database (no migrations)
bun run db:push

# Create and run migrations
bun run db:migrate

# Seed database with test data
bun run db:seed
```

Or run directly in this package:

```bash
cd packages/database

# Generate client
bun run db:generate

# Push schema
bun run db:push

# Run migrations
bun run db:migrate

# Seed data
bun run db:seed
```

## 📊 Schema

The schema is located at `./prisma/schema.prisma` and includes:

- **Auth Models**: User, Account, Session (Auth.js integration)
- **Monitoring**: MonitoringTarget, SpeedTestResult
- **Alerting**: AlertRule, IncidentEvent
- **Notifications**: Notification, PushSubscription

## 🔧 Development

When you modify the schema:

1. Update `prisma/schema.prisma`
2. Run `bun run db:generate` to update Prisma Client
3. Run `bun run db:push` (dev) or `bun run db:migrate` (prod)
4. Optionally run `bun run db:seed` for test data

## 🏗️ Repository Pattern

This package will contain repository implementations that abstract Prisma:

```typescript
// Coming soon: Repository implementations
import { UserRepository } from '@network-monitor/database';
import { MonitoringTargetRepository } from '@network-monitor/database';
```

For now, Prisma Client is generated to `node_modules/@prisma/client` and can be imported directly.
