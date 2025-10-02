# Monitor Worker Dockerfile
FROM oven/bun:1.0-alpine AS base
WORKDIR /app

# Copy workspace files
COPY package.json bun.lockb turbo.json ./
COPY packages/ ./packages/
COPY apps/monitor-worker/ ./apps/monitor-worker/

# Install dependencies
RUN bun install --frozen-lockfile

# Build packages
RUN bunx turbo run build --filter=monitor-worker

# Production image
FROM oven/bun:1.0-alpine AS production
WORKDIR /app

# Copy built files
COPY --from=base /app/apps/monitor-worker/dist ./
COPY --from=base /app/node_modules ./node_modules

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S bun -u 1001
USER bun

# Start monitor worker
CMD ["bun", "run", "main.js"]
