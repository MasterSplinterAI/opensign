#!/bin/bash

# PDF Signer Deployment Script for AWS EC2
# Domain: sign.jarmetals.com
# Run as: sudo ./deploy.sh

set -e

# Configuration
DOMAIN="sign.jarmetals.com"
APP_NAME="pdf-signer"
APP_DIR="/var/www/$APP_NAME"
PORT=3001
USER="ubuntu"

echo "🚀 Starting deployment of PDF Signer to $DOMAIN..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install required packages
echo "🔧 Installing required packages..."
apt install -y curl git nginx certbot python3-certbot-nginx

# Install Node.js 18.x if not present
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi

# Install PM2 globally if not present
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Create app directory
echo "📁 Creating application directory..."
mkdir -p $APP_DIR
chown -R $USER:$USER $APP_DIR

# Clone or update repository
echo "📥 Cloning repository..."
if [ -d "$APP_DIR/.git" ]; then
    cd $APP_DIR
    sudo -u $USER git pull origin main
else
    sudo -u $USER git clone https://github.com/MasterSplinterAI/opensign.git $APP_DIR
fi

cd $APP_DIR

# Install dependencies
echo "📦 Installing Node.js dependencies..."
sudo -u $USER npm install

# Build the application
echo "🔨 Building application..."
sudo -u $USER npm run build

# Create PM2 ecosystem file
echo "⚙️  Creating PM2 configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'npx',
    args: 'serve -s build -l $PORT',
    cwd: '$APP_DIR',
    env: {
      NODE_ENV: 'production',
      PORT: $PORT
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/pm2/$APP_NAME-error.log',
    out_file: '/var/log/pm2/$APP_NAME-out.log',
    log_file: '/var/log/pm2/$APP_NAME.log'
  }]
};
EOF

# Create PM2 log directory
mkdir -p /var/log/pm2
chown -R $USER:$USER /var/log/pm2

# Install serve globally if not present
if ! command -v serve &> /dev/null; then
    echo "📦 Installing serve..."
    npm install -g serve
fi

# Stop existing PM2 process if running
echo "🛑 Stopping existing PM2 process..."
sudo -u $USER pm2 stop $APP_NAME 2>/dev/null || true
sudo -u $USER pm2 delete $APP_NAME 2>/dev/null || true

# Start PM2 process
echo "🚀 Starting PM2 process..."
sudo -u $USER pm2 start ecosystem.config.js
sudo -u $USER pm2 save

# Setup PM2 startup
pm2 startup systemd -u $USER --hp /home/$USER
sudo -u $USER pm2 save

# Create nginx configuration
echo "🌐 Creating Nginx configuration..."
cat > /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Static file caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
        proxy_pass http://localhost:$PORT;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Block access to hidden files
    location ~ /\. {
        deny all;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo "🔍 Testing Nginx configuration..."
nginx -t

# Restart nginx
echo "🔄 Restarting Nginx..."
systemctl restart nginx

# Enable nginx to start on boot
systemctl enable nginx

echo "🔒 Setting up SSL certificate with Let's Encrypt..."

# Get SSL certificate
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@jarmetals.com --redirect

# Setup auto-renewal
echo "⏰ Setting up SSL certificate auto-renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Create a simple health check
echo "🏥 Creating health check..."
cat > /usr/local/bin/pdf-signer-health.sh << 'EOF'
#!/bin/bash
if curl -f -s http://localhost:3001 > /dev/null; then
    echo "PDF Signer is healthy"
    exit 0
else
    echo "PDF Signer is down, restarting..."
    sudo -u ubuntu pm2 restart pdf-signer
    exit 1
fi
EOF

chmod +x /usr/local/bin/pdf-signer-health.sh

# Add health check to cron
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/pdf-signer-health.sh") | crontab -

# Set proper permissions
chown -R $USER:$USER $APP_DIR

echo "✅ Deployment completed successfully!"
echo ""
echo "🎉 Your PDF Signer is now available at: https://$DOMAIN"
echo ""
echo "📊 Useful commands:"
echo "  pm2 status                 - Check PM2 processes"
echo "  pm2 logs $APP_NAME         - View application logs"
echo "  pm2 restart $APP_NAME      - Restart the application"
echo "  sudo systemctl status nginx - Check Nginx status"
echo "  sudo certbot renew --dry-run - Test SSL renewal"
echo ""
echo "🔧 Configuration files:"
echo "  App: $APP_DIR"
echo "  Nginx: /etc/nginx/sites-available/$APP_NAME"
echo "  PM2: $APP_DIR/ecosystem.config.js"
echo "  Logs: /var/log/pm2/" 