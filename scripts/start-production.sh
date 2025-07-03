#!/bin/sh
# Production startup script for ATT System Metrics API
set -e

echo "🚀 Starting ATT System Metrics API in production..."

# Create logs directory if it doesn't exist
mkdir -p logs

# Install PM2 globally if not present
if ! command -v pm2 >/dev/null 2>&1; then
    echo "📦 Installing PM2 globally..."
    npm install -g pm2
fi

# Start the application with PM2
echo "🔄 Starting metrics-api with PM2..."
pm2 start pm2.config.js

# Save PM2 configuration for startup
echo "💾 Saving PM2 configuration..."
pm2 save

# Setup PM2 to start on boot
echo "🔧 Setting up PM2 startup script..."
pm2 startup

echo "✅ ATT System Metrics API started successfully!"
echo "📊 Check status: pm2 list"
echo "📋 View logs: pm2 logs metrics-api"
echo "🔄 Restart: pm2 restart metrics-api"