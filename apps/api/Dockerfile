# Monolith Dockerfile - All services in one container
FROM oven/bun:1.0-alpine AS base
WORKDIR /app

# Copy workspace files
COPY package.json bun.lockb turbo.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Install dependencies
RUN bun install --frozen-lockfile

# Build packages
RUN bunx turbo run build --filter=api

# Production image
FROM oven/bun:1.0-alpine AS production
WORKDIR /app

# Copy built files
COPY --from=base /app/apps/api/dist ./
COPY --from=base /app/node_modules ./node_modules

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S bun -u 1001
USER bun

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun run healthcheck.js || exit 1

# Start monolith
CMD ["bun", "run", "main.js"]
