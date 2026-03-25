# PlanForge Backend Deployment Guide

## Prerequisites
- Tencent Cloud server with Ubuntu 20.04+
- Domain name: `planforge-api.lucaslinn.cc.cd` (A record pointing to your server IP)
- SSH access to the server

## Quick Start

### 1. Configure Environment Variables

On your server, create `.env` file:
```bash
cd /var/www/planforge-api
cp .env.example .env
nano .env
```

Edit `.env`:
```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://planforge.lucaslinn.cc.cd
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
mkdir -p /var/www/planforge-api
# Copy files from local: rsync -avz ./backend/ user@server:/var/www/planforge-api/
cd /var/www/planforge-api
npm install --production
```

### Configure Nginx
```bash
cp deploy/nginx.conf /etc/nginx/sites-available/planforge-api
ln -sf /etc/nginx/sites-available/planforge-api /etc/nginx/sites-enabled/planforge-api
nginx -t
systemctl reload nginx
```

### Get SSL Certificate
```bash
certbot --nginx -d planforge-api.lucaslinn.cc.cd
```

### Create Systemd Service
```bash
# Create /etc/systemd/system/planforge-api.service with the content from deploy.sh
systemctl daemon-reload
systemctl enable planforge-api
systemctl start planforge-api
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
systemctl status planforge-api
journalctl -u planforge-api -f
```

### Check Nginx logs
```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Restart services
```bash
systemctl restart planforge-api
systemctl reload nginx
```

## Update Deployment

```bash
# Pull latest code
cd /var/www/planforge-api
git pull

# Install dependencies
npm install --production

# Restart service
systemctl restart planforge-api
```
