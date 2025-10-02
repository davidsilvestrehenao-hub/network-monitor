#!/bin/bash

# Template Extraction Script
# Usage: ./scripts/extract-template.sh <new-project-name>

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <new-project-name>"
    echo "Example: $0 my-ecommerce-app"
    exit 1
fi

NEW_PROJECT_NAME="$1"
NEW_PROJECT_DIR="../$NEW_PROJECT_NAME"

echo "🚀 Extracting template for: $NEW_PROJECT_NAME"
echo "📁 Target directory: $NEW_PROJECT_DIR"

# Check if target directory exists
if [ -d "$NEW_PROJECT_DIR" ]; then
    echo "❌ Error: Directory $NEW_PROJECT_DIR already exists"
    exit 1
fi

# Create new project directory
echo "📁 Creating new project directory..."
mkdir -p "$NEW_PROJECT_DIR"

# Copy entire project
echo "📋 Copying project files..."
cp -r . "$NEW_PROJECT_DIR/"

# Navigate to new project
cd "$NEW_PROJECT_DIR"

# Remove template and domain-specific directories
echo "🧹 Cleaning up template files..."
rm -rf .cursor/rules/template/
rm -rf .cursor/rules/network-monitor/

# Remove git history
echo "🗑️ Removing git history..."
rm -rf .git/

# Initialize new git repository
echo "🔧 Initializing new git repository..."
git init
git add .
git commit -m "feat: Initial template extraction for $NEW_PROJECT_NAME"

# Update package.json
echo "📦 Updating package.json..."
if command -v sed &> /dev/null; then
    sed -i.bak "s/network-monitor/$NEW_PROJECT_NAME/g" package.json
    rm package.json.bak
else
    echo "⚠️ Warning: sed not available, please manually update package.json"
fi

# Update app.config.ts
echo "⚙️ Updating app.config.ts..."
if command -v sed &> /dev/null; then
    sed -i.bak "s/network-monitor/$NEW_PROJECT_NAME/g" app.config.ts
    rm app.config.ts.bak
else
    echo "⚠️ Warning: sed not available, please manually update app.config.ts"
fi

# Create domain directory
echo "📁 Creating domain directory..."
mkdir -p .cursor/rules/my-domain

# Copy template files to domain
echo "📋 Setting up domain files..."
cp .cursor/rules/05-domain-requirements.mdc .cursor/rules/my-domain/
cp .cursor/rules/70-database-schema.mdc .cursor/rules/my-domain/

# Create README for new project
echo "📝 Creating project README..."
cat > README.md << EOF
# $NEW_PROJECT_NAME

This project was created from the Network Monitor template.

## 🚀 Quick Start

1. Install dependencies:
   \`\`\`bash
   bun install
   \`\`\`

2. Set up environment:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

3. Set up database:
   \`\`\`bash
   bun run db:generate
   bun run db:migrate
   \`\`\`

4. Start development:
   \`\`\`bash
   bun run dev
   \`\`\`

## 📋 Next Steps

1. **Customize Domain Requirements**:
   - Edit \`.cursor/rules/05-domain-requirements.mdc\`
   - Edit \`.cursor/rules/my-domain/05-requirements.mdc\`

2. **Customize Database Schema**:
   - Edit \`.cursor/rules/70-database-schema.mdc\`
   - Edit \`.cursor/rules/my-domain/70-database-schema.mdc\`
   - Update \`packages/database/prisma/schema.prisma\`

3. **Update Code References**:
   - Replace domain-specific terms throughout codebase
   - Update entity names and relationships
   - Update service names and API endpoints

4. **Follow Template Extraction Guide**:
   - See \`docs/TEMPLATE-EXTRACTION-GUIDE.md\` for detailed instructions

## 📚 Documentation

- **Template Extraction**: \`docs/TEMPLATE-EXTRACTION-GUIDE.md\`
- **Architecture**: \`.cursor/rules/00-core-architecture.mdc\`
- **Domain Requirements**: \`.cursor/rules/my-domain/05-requirements.mdc\`
- **Database Schema**: \`.cursor/rules/my-domain/70-database-schema.mdc\`

## 🎯 Template Features

This template includes:
- ✅ Monorepo structure (Turborepo)
- ✅ SolidJS + SolidStart frontend
- ✅ tRPC API with end-to-end type safety
- ✅ Prisma ORM with PostgreSQL/SQLite
- ✅ 12-Factor App compliance
- ✅ Event-driven architecture
- ✅ Dependency injection
- ✅ Repository pattern
- ✅ Comprehensive testing
- ✅ Docker deployment
- ✅ PWA capabilities

Happy coding! 🚀
EOF

echo ""
echo "✅ Template extraction complete!"
echo ""
echo "📁 New project location: $NEW_PROJECT_DIR"
echo "🚀 Next steps:"
echo "   1. cd $NEW_PROJECT_DIR"
echo "   2. bun install"
echo "   3. Follow the README.md instructions"
echo "   4. Customize domain requirements and database schema"
echo ""
echo "📚 See docs/TEMPLATE-EXTRACTION-GUIDE.md for detailed instructions"
