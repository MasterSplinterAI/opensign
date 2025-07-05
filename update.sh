#!/bin/bash

# PDF Signer Update Script
# For quick updates without full deployment
# Run as: sudo ./update.sh

set -e

# Configuration
DOMAIN="sign.jarmetals.com"
APP_NAME="pdf-signer"
APP_DIR="/var/www/$APP_NAME"
PORT=3001
USER="ubuntu"

echo "🔄 Starting update for PDF Signer..."

# Go to app directory
cd $APP_DIR

# Pull latest changes
echo "📥 Pulling latest changes..."
sudo -u $USER git pull origin main

# Install/update dependencies
echo "📦 Installing dependencies..."
sudo -u $USER npm install

# Build the application
echo "🔨 Building application..."
sudo -u $USER npm run build

# Restart PM2 process
echo "🚀 Restarting application..."
sudo -u $USER pm2 restart $APP_NAME

# Wait a moment for restart
sleep 3

# Check if app is running
echo "🏥 Checking application health..."
if curl -f -s http://localhost:$PORT > /dev/null; then
    echo "✅ Application is running successfully!"
    echo "🎉 Update completed! Visit: https://$DOMAIN"
else
    echo "❌ Application failed to start. Check logs:"
    echo "  pm2 logs $APP_NAME"
    exit 1
fi

echo ""
echo "📊 Application status:"
sudo -u $USER pm2 status 