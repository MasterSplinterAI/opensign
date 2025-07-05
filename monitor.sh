#!/bin/bash

# PDF Signer Monitoring Script
# Quick health check and status overview
# Run as: ./monitor.sh

# Configuration
DOMAIN="sign.jarmetals.com"
APP_NAME="pdf-signer"
APP_DIR="/var/www/$APP_NAME"
PORT=3001

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 PDF Signer Health Check${NC}"
echo "=============================="

# Check if application is running locally
echo -e "\n${YELLOW}📡 Local Application Status:${NC}"
if curl -f -s http://localhost:$PORT > /dev/null; then
    echo -e "✅ Application is ${GREEN}running${NC} on port $PORT"
else
    echo -e "❌ Application is ${RED}not responding${NC} on port $PORT"
fi

# Check if domain is accessible
echo -e "\n${YELLOW}🌐 Domain Status:${NC}"
if curl -f -s https://$DOMAIN > /dev/null; then
    echo -e "✅ Domain ${GREEN}accessible${NC} at https://$DOMAIN"
else
    echo -e "❌ Domain ${RED}not accessible${NC} at https://$DOMAIN"
fi

# PM2 Status
echo -e "\n${YELLOW}⚙️  PM2 Process Status:${NC}"
if command -v pm2 &> /dev/null; then
    sudo -u ubuntu pm2 status | grep -E "(pdf-signer|App name|online|errored|stopped)"
else
    echo -e "❌ PM2 not installed"
fi

# Nginx Status
echo -e "\n${YELLOW}🌐 Nginx Status:${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "✅ Nginx is ${GREEN}running${NC}"
else
    echo -e "❌ Nginx is ${RED}not running${NC}"
fi

# SSL Certificate Status
echo -e "\n${YELLOW}🔒 SSL Certificate Status:${NC}"
if command -v certbot &> /dev/null; then
    ssl_info=$(sudo certbot certificates 2>/dev/null | grep -A 2 "$DOMAIN")
    if [[ -n "$ssl_info" ]]; then
        echo -e "✅ SSL certificate ${GREEN}installed${NC}"
        echo "$ssl_info" | grep -E "(Certificate Name|Expiry Date)"
    else
        echo -e "❌ SSL certificate ${RED}not found${NC}"
    fi
else
    echo -e "❌ Certbot not installed"
fi

# Disk Space
echo -e "\n${YELLOW}💾 Disk Usage:${NC}"
df -h / | grep -E "(Filesystem|/dev/)"

# Memory Usage
echo -e "\n${YELLOW}🧠 Memory Usage:${NC}"
free -h | grep -E "(total|Mem)"

# Recent Application Logs
echo -e "\n${YELLOW}📋 Recent Application Logs:${NC}"
if [ -f "/var/log/pm2/pdf-signer.log" ]; then
    tail -n 5 /var/log/pm2/pdf-signer.log
else
    echo "No logs found"
fi

# Check for errors
echo -e "\n${YELLOW}🚨 Recent Errors:${NC}"
if [ -f "/var/log/pm2/pdf-signer-error.log" ]; then
    error_count=$(wc -l < /var/log/pm2/pdf-signer-error.log)
    if [ $error_count -gt 0 ]; then
        echo -e "⚠️  Found ${YELLOW}$error_count${NC} error entries"
        tail -n 3 /var/log/pm2/pdf-signer-error.log
    else
        echo -e "✅ No errors found"
    fi
else
    echo -e "✅ No error log found"
fi

echo -e "\n${BLUE}=============================="
echo -e "🔧 Useful Commands:"
echo -e "  ${GREEN}pm2 restart pdf-signer${NC}    - Restart app"
echo -e "  ${GREEN}pm2 logs pdf-signer${NC}       - View logs"
echo -e "  ${GREEN}sudo systemctl restart nginx${NC} - Restart nginx"
echo -e "  ${GREEN}sudo ./update.sh${NC}           - Update app"
echo -e "==============================" 