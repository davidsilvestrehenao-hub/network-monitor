#!/bin/bash
set -e

echo "🔄 Fixing timestamp comparisons in MockSpeedTestResultRepository..."

# Fix all .getTime() calls on strings - they should use new Date(string).getTime()
sed -i '' 's/\.createdAt\.getTime()/new Date(\&.createdAt).getTime()/g' src/mocks/MockSpeedTestResultRepository.ts
sed -i '' 's/\.timestamp\.getTime()/new Date(\&.timestamp).getTime()/g' src/mocks/MockSpeedTestResultRepository.ts

# Fix date comparisons
sed -i '' 's/result\.createdAt >= query\.startDate/new Date(result.createdAt) >= query.startDate/g' src/mocks/MockSpeedTestResultRepository.ts
sed -i '' 's/result\.createdAt <= query\.endDate/new Date(result.createdAt) <= query.endDate/g' src/mocks/MockSpeedTestResultRepository.ts

echo "✅ Timestamp fixes complete!"
