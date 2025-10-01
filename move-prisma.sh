#!/bin/bash
set -e

echo "📦 Moving Prisma files to database package..."

# 1. Move database files
echo "Moving database files..."
mv prisma/db.sqlite packages/database/prisma/ 2>/dev/null || true
mv prisma/dev.db packages/database/prisma/ 2>/dev/null || true

# 2. Update .gitignore to reference new location
echo "Updating .gitignore..."
if [ -f .gitignore ]; then
  sed -i '' 's|^prisma/dev.db|packages/database/prisma/dev.db|g' .gitignore
  sed -i '' 's|^prisma/\*.db|packages/database/prisma/*.db|g' .gitignore
fi

# 3. Update DATABASE_URL in .env if it exists
echo "Updating .env files..."
if [ -f .env ]; then
  sed -i '' 's|file:./prisma/dev.db|file:./packages/database/prisma/dev.db|g' .env
fi
if [ -f .env.local ]; then
  sed -i '' 's|file:./prisma/dev.db|file:./packages/database/prisma/dev.db|g' .env.local
fi

# 4. Delete old prisma directory
echo "Removing old prisma directory..."
rm -rf prisma/

echo "✅ Prisma migration complete!"
echo "📊 Prisma is now at: packages/database/prisma/"
