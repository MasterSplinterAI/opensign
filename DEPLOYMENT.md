# PDF Signer Deployment Guide for AWS EC2

## 🚀 Quick Start

Deploy your PDF signer to `sign.jarmetals.com` on AWS EC2 with SSL encryption.

### Prerequisites
- AWS EC2 instance running Ubuntu 20.04+
- Domain `sign.jarmetals.com` pointed to your EC2 IP address
- SSH access to your EC2 instance

### Step 1: Upload Deployment Files

1. **Clone the repository on your local machine** (if not already done):
   ```bash
   git clone https://github.com/MasterSplinterAI/opensign.git
   cd opensign
   ```

2. **Copy deployment files to your EC2 server**:
   ```bash
   scp -i your-key.pem deploy.sh ubuntu@3.133.136.182:~/
   scp -i your-key.pem update.sh ubuntu@3.133.136.182:~/
   scp -i your-key.pem DEPLOYMENT.md ubuntu@3.133.136.182:~/
   ```

### Step 2: SSH into Your Server

```bash
ssh -i your-key.pem ubuntu@3.133.136.182
```

### Step 3: Make Scripts Executable

```bash
chmod +x deploy.sh update.sh
```

### Step 4: Run Full Deployment

```bash
sudo ./deploy.sh
```

The deployment script will:
- ✅ Install Node.js, PM2, Nginx, and Certbot
- ✅ Clone your repository to `/var/www/pdf-signer`
- ✅ Build the React application
- ✅ Configure PM2 process management
- ✅ Setup Nginx reverse proxy
- ✅ Install SSL certificate with Let's Encrypt
- ✅ Setup auto-renewal for SSL
- ✅ Create health monitoring

### Step 5: Verify Deployment

After deployment, your PDF signer will be available at:
**https://sign.jarmetals.com**

## 🔄 Future Updates

For future code updates, simply run:
```bash
sudo ./update.sh
```

This will pull latest changes, rebuild, and restart the application.

## 📊 Monitoring Commands

### Check Application Status
```bash
pm2 status
pm2 logs pdf-signer
```

### Check Nginx Status
```bash
sudo systemctl status nginx
sudo nginx -t  # Test configuration
```

### Check SSL Certificate
```bash
sudo certbot certificates
sudo certbot renew --dry-run  # Test renewal
```

## 🏗️ Architecture

```
Internet → Route 53/DNS → EC2 Instance
                ↓
            Nginx (Port 80/443)
                ↓
            PM2 Process Manager
                ↓
            PDF Signer App (Port 3001)
```

## 📁 File Structure

```
/var/www/pdf-signer/          # Application directory
├── build/                    # React build files
├── src/                      # Source code
├── ecosystem.config.js       # PM2 configuration
└── package.json             # Dependencies

/etc/nginx/sites-available/   # Nginx configuration
└── pdf-signer

/var/log/pm2/                # Application logs
├── pdf-signer-error.log
├── pdf-signer-out.log
└── pdf-signer.log
```

## 🔧 Configuration Details

### Port Configuration
- **Application**: Port 3001 (internal)
- **Nginx**: Port 80 (HTTP) → 443 (HTTPS)
- **SSL**: Let's Encrypt certificate

### PM2 Configuration
- **Process name**: pdf-signer
- **Memory limit**: 1GB
- **Restart policy**: On failure
- **Logs**: `/var/log/pm2/`

### Nginx Configuration
- **Server name**: sign.jarmetals.com
- **SSL redirect**: HTTP → HTTPS
- **Security headers**: Enabled
- **Gzip compression**: Enabled
- **Static file caching**: 1 year

## 🚨 Troubleshooting

### Application Won't Start
```bash
pm2 logs pdf-signer
pm2 restart pdf-signer
```

### Nginx Issues
```bash
sudo systemctl status nginx
sudo nginx -t
sudo systemctl restart nginx
```

### SSL Certificate Issues
```bash
sudo certbot certificates
sudo certbot renew --force-renewal -d sign.jarmetals.com
```

### Domain Not Resolving
- Check DNS settings for sign.jarmetals.com
- Verify it points to your EC2 IP: 3.133.136.182
- Allow port 80 and 443 in EC2 security groups

## 🔒 Security Features

- ✅ SSL/TLS encryption (Let's Encrypt)
- ✅ Security headers (XSS, CSRF protection)
- ✅ Hidden file protection
- ✅ Automatic SSL renewal
- ✅ Health monitoring and auto-restart

## 📈 Performance Features

- ✅ Gzip compression
- ✅ Static file caching
- ✅ Process monitoring (PM2)
- ✅ Memory limit protection
- ✅ Optimized React build

## 🎯 Next Steps

1. **Monitor your application** using PM2 dashboard
2. **Set up monitoring** with CloudWatch or other tools
3. **Configure backups** for your application
4. **Add CI/CD pipeline** for automated deployments

## 📞 Support

If you encounter issues:
1. Check the logs: `pm2 logs pdf-signer`
2. Verify all services are running: `sudo systemctl status nginx`
3. Test SSL: `sudo certbot renew --dry-run`

Your PDF signer is now ready for production use! 🎉 