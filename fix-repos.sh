#!/bin/bash
set -e

echo "🔄 Fixing repository mappers..."

# Fix SpeedTestRepository
sed -i '' 's/id: result.id,/id: result.id.toString(),/g' packages/database/src/repositories/SpeedTestRepository.ts
sed -i '' 's/error: result.error,/error: result.error ?? undefined,/g' packages/database/src/repositories/SpeedTestRepository.ts  
sed -i '' 's/createdAt: result.createdAt,/createdAt: result.createdAt.toISOString(),\n      timestamp: result.createdAt.toISOString(),/g' packages/database/src/repositories/SpeedTestRepository.ts
sed -i '' '/timestamp: result.createdAt.toISOString(),$/s/upload: null,/upload: null, \/\/ Prisma schema does not have upload yet/g' packages/database/src/repositories/SpeedTestRepository.ts

echo "✅ Repository fixes applied!"
