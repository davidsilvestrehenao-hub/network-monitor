#!/bin/bash
set -e

echo "🔄 Fixing remaining infrastructure errors..."

# Fix WinstonLoggerService import
sed -i '' 's|from "../interfaces/ILogger"|from "@network-monitor/shared"|g' packages/infrastructure/src/logger/WinstonLoggerService.ts

# Fix MockAlerting import
sed -i '' 's|from "~/lib/types/mock-types"|from "@network-monitor/shared"|g' packages/infrastructure/src/mocks/MockAlerting.ts

# Fix MockDatabase import  
sed -i '' 's|from "~/lib/types/mock-types"|from "@network-monitor/shared"|g' packages/infrastructure/src/mocks/MockDatabase.ts

# Fix date comparisons in MockSpeedTestResultRepository
sed -i '' 's/result.createdAt >=/new Date(result.createdAt) >=/g' packages/infrastructure/src/mocks/MockSpeedTestResultRepository.ts
sed -i '' 's/result.createdAt <=/new Date(result.createdAt) <=/g' packages/infrastructure/src/mocks/MockSpeedTestResultRepository.ts

echo "✅ Infrastructure fixes complete!"
