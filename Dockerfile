# Multi-stage Node 18-alpine build for ATT Metrics API
FROM node:18-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory and non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S attapi -u 1001 -G nodejs

WORKDIR /app

# Copy package files
COPY package*.json ./

# Production dependencies stage
FROM base AS deps
RUN npm ci --only=production && npm cache clean --force

# Final production stage
FROM base AS runner

# Copy production dependencies
COPY --from=deps --chown=attapi:nodejs /app/node_modules ./node_modules

# Copy application source
COPY --chown=attapi:nodejs api-server.js ./
COPY --chown=attapi:nodejs metrics/ ./metrics/
COPY --chown=attapi:nodejs shared/ ./shared/

# Create data directory for file mounts
RUN mkdir -p /app/data && chown attapi:nodejs /app/data

# Switch to non-root user
USER attapi

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/status || exit 1

# Start application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "api-server.js"]