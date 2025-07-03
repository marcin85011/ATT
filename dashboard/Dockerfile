# Multi-stage build for ATT Dashboard React App
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set production environment for build
ENV NODE_ENV=production
ENV VITE_USE_MOCKS=false
ENV VITE_API_BASE_URL=http://localhost:4000

# Build the application
RUN npm run build

# Production nginx stage
FROM nginx:alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create nginx user with specific uid/gid
RUN addgroup -g 1001 -S nodejs && \
    adduser -S attdash -u 1001 -G nodejs

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx cache directories with proper ownership
RUN mkdir -p /var/cache/nginx/client_temp \
             /var/cache/nginx/proxy_temp \
             /var/cache/nginx/fastcgi_temp \
             /var/cache/nginx/uwsgi_temp \
             /var/cache/nginx/scgi_temp && \
    chown -R attdash:nodejs /var/cache/nginx \
                           /var/run \
                           /var/log/nginx \
                           /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx

# Switch to non-root user
USER attdash

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start nginx with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]