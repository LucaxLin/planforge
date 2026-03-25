#!/bin/bash
# PlanForge Backend Deployment Script
# Run on your Tencent Cloud server

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== PlanForge Backend Deployment ===${NC}\n"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

# Configuration
APP_DIR="/var/www/planforge"
SERVICE_NAME="planforge"
PORT=3001

# Step 1: Install dependencies
echo -e "${YELLOW}[1/6] Installing dependencies...${NC}"
apt update
apt install -y nodejs npm nginx certbot python3-certbot-nginx

# Step 2: Create app directory
echo -e "${YELLOW}[2/6] Setting up application directory...${NC}"
mkdir -p $APP_DIR
mkdir -p $APP_DIR/data

# Step 3: Copy application files
echo -e "${YELLOW}[3/6] Copying application files...${NC}"
# Run this from your local machine:
# rsync -avz --exclude='node_modules' --exclude='.git' --exclude='data' ./backend/ user@your-server:$APP_DIR/

# Install Node.js dependencies (including tsx for running TypeScript directly)
echo -e "${YELLOW}[4/6] Installing Node.js dependencies...${NC}"
cd $APP_DIR
npm install --include=dev

# Step 5: Set permissions
echo -e "${YELLOW}[5/6] Setting permissions...${NC}"
chmod 600 $APP_DIR/data/*.json 2>/dev/null || true
chown -R www-data:www-data $APP_DIR

# Step 6: Setup Nginx
echo -e "${YELLOW}[6/6] Setting up Nginx...${NC}"
cp $APP_DIR/deploy/nginx.conf /etc/nginx/sites-available/$SERVICE_NAME
ln -sf /etc/nginx/sites-available/$SERVICE_NAME /etc/nginx/sites-enabled/$SERVICE_NAME

# Test Nginx config
nginx -t

# Reload Nginx
systemctl reload nginx

# Get SSL certificate
echo -e "${YELLOW}Getting SSL certificate...${NC}"
certbot certonly --manual --preferred-challenges dns -d planforge-api.lucaslinn.cc.cd

# Create systemd service
cat > /etc/systemd/system/$SERVICE_NAME.service << EOF
[Unit]
Description=PlanForge API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$APP_DIR
ExecStart=$(which npx) tsx src/app.ts
Restart=on-failure
Environment=NODE_ENV=production
EnvironmentFile=$APP_DIR/.env

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
systemctl daemon-reload
systemctl enable $SERVICE_NAME
systemctl restart $SERVICE_NAME

echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo -e "Service status: ${YELLOW}"
systemctl status $SERVICE_NAME --no-pager
echo -e "${NC}API should be available at: https://planforge-api.lucaslinn.cc.cd"
