#!/bin/bash
set -e

echo "🚀 Starting service migration to Turborepo packages..."

# 1. Move DatabaseService to packages/database
echo "📦 Moving DatabaseService..."
cp src/lib/services/concrete/DatabaseService.ts packages/database/src/DatabaseService.ts

# 2. Move all repositories to packages/database/src/repositories/
echo "📦 Moving repositories..."
mkdir -p packages/database/src/repositories
cp src/lib/services/concrete/*Repository.ts packages/database/src/repositories/

# 3. Move mocks to packages/database/src/mocks/
echo "📦 Moving mock repositories..."
mkdir -p packages/database/src/mocks
cp src/lib/services/mocks/Mock*Repository.ts packages/database/src/mocks/

# 4. Move AuthService to packages/auth (create if needed)
echo "📦 Creating auth package and moving AuthService..."
mkdir -p packages/auth/src
cp src/lib/services/concrete/AuthService.ts packages/auth/src/
cp src/lib/services/concrete/MockAuth.ts packages/auth/src/

# 5. Move SpeedTestService and related to packages/speed-test
echo "📦 Creating speed-test package..."
mkdir -p packages/speed-test/src
cp src/lib/services/concrete/SpeedTestService.ts packages/speed-test/src/
cp src/lib/services/concrete/SpeedTestConfigService.ts packages/speed-test/src/
cp src/lib/services/concrete/MonitoringScheduler.ts packages/speed-test/src/

# 6. Move mocks to infrastructure
echo "📦 Moving infrastructure mocks..."
mkdir -p packages/infrastructure/src/mocks
cp src/lib/services/mocks/MockDatabase.ts packages/infrastructure/src/mocks/
cp src/lib/services/mocks/MockLogger.ts packages/infrastructure/src/mocks/
cp src/lib/services/mocks/Mock*.ts packages/infrastructure/src/mocks/ 2>/dev/null || true

# 7. Move WinstonLogger to infrastructure
echo "📦 Moving WinstonLoggerService..."
cp src/lib/services/concrete/WinstonLoggerService.ts packages/infrastructure/src/logger/

echo "✅ Migration complete! Files copied to packages."
echo "⚠️  Next: Update imports and delete old src/lib/services/"
