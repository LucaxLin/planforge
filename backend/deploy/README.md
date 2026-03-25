# PlanForge Backend Deployment Guide

## Prerequisites
- Tencent Cloud server with Ubuntu 20.04+
- Domain name: `planforge.lucaslinn.cc.cd` (A record pointing to your server IP)
- SSH access to the server

## Quick Start

### 1. Configure Environment Variables

On your server, use the production config:
```bash
cd /var/www/planforge
cp .env.prod .env
```

### 2. Run Deployment Script

```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

### 3. Secure Data Files

```bash
chmod +x secure-data.sh
sudo ./secure-data.sh
```

## Manual Setup (Alternative)

### Install Dependencies
```bash
apt update && apt install -y nodejs npm nginx certbot python3-certbot-nginx
```

### Setup Application
```bash
mkdir -p /var/www/planforge
# Copy files from local: rsync -avz ./backend/ user@server:/var/www/planforge/
cd /var/www/planforge
npm install --production
```

### Configure Nginx
```bash
cp deploy/nginx.conf /etc/nginx/sites-available/planforge
ln -sf /etc/nginx/sites-available/planforge /etc/nginx/sites-enabled/planforge
nginx -t
systemctl reload nginx
```

### Get SSL Certificate
```bash
certbot --nginx -d planforge.lucaslinn.cc.cd
```

### Create Systemd Service
```bash
# Create /etc/systemd/system/planforge.service with the content from deploy.sh
systemctl daemon-reload
systemctl enable planforge
systemctl start planforge
```

## Security Checklist

- [ ] `.env` file created with correct `CORS_ORIGIN`
- [ ] Data files have correct permissions (`600`)
- [ ] SSL certificate obtained
- [ ] Nginx configuration tested
- [ ] Firewall allows only 80, 443

## Troubleshooting

### Check service status
```bash
systemctl status planforge
journalctl -u planforge -f
```

### Check Nginx logs
```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Restart services
```bash
systemctl restart planforge
systemctl reload nginx
```

## Update Deployment

```bash
# Pull latest code
cd /var/www/planforge
git pull

# Install dependencies
npm install --production

# Restart service
systemctl restart planforge
```
