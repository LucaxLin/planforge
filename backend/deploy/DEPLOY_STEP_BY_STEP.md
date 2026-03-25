# PlanForge 后端部署 Step by Step 教程

## 准备工作

### 需要的材料
- 腾讯云服务器 (Ubuntu 20.04+)
- 域名：`planforge.lucaslinn.cc.cd` (已解析到服务器IP)

---

## Step 1: 服务器初始化

用 SSH 连接到你的腾讯云服务器：

```bash
ssh root@你的服务器IP
```

### 1.1 更新系统
```bash
apt update && apt upgrade -y
```

### 1.2 安装基础软件
```bash
apt install -y nodejs npm nginx certbot python3-certbot-nginx git
```

### 1.3 验证安装
```bash
node -v    # 应该显示 v18.x 或更高
npm -v
nginx -v
```

---

## Step 2: 创建应用目录

```bash
mkdir -p /var/www/planforge
mkdir -p /var/www/planforge/data
```

---

## Step 3: 上传代码到服务器

**在你的本地电脑执行：**

```bash
# 进入项目目录
cd D:\planforge

# 上传 backend 代码（排除不需要的文件）
rsync -avz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='data' \
  --exclude='dist' \
  ./backend/ root@你的服务器IP:/var/www/planforge/
```

---

## Step 4: 配置环境变量

**在服务器上执行：**

```bash
cd /var/www/planforge

# 复制生产环境配置
cp .env.prod .env

# 编辑 .env 文件
nano .env
```

确认内容如下：
```
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://planforge.lucaslinn.cc.cd
```

保存退出：`Ctrl+X` → `Y` → `Enter`

---

## Step 5: 安装 Node.js 依赖

```bash
cd /var/www/planforge
npm install
```

等待安装完成...

---

## Step 6: 配置 Nginx

### 6.1 创建 Nginx 配置文件
```bash
nano /etc/nginx/sites-available/planforge
```

粘贴以下内容：
```nginx
server {
    listen 80;
    server_name planforge.lucaslinn.cc.cd;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name planforge.lucaslinn.cc.cd;

    ssl_certificate /etc/letsencrypt/live/planforge.lucaslinn.cc.cd/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/planforge.lucaslinn.cc.cd/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_set_header Accept '';
        proxy_set_header Accept-Encoding '';
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    location /health {
        proxy_pass http://127.0.0.1:3001;
        access_log off;
    }

    location ~ /\. {
        deny all;
    }
}
```

保存退出：`Ctrl+X` → `Y` → `Enter`

### 6.2 启用站点
```bash
ln -sf /etc/nginx/sites-available/planforge /etc/nginx/sites-enabled/
nginx -t
```

---

## Step 7: 获取 SSL 证书

```bash
certbot --nginx -d planforge.lucaslinn.cc.cd
```

按提示操作：
- 输入邮箱
- 同意条款 (A)
- 是否分享邮箱 (N)
- 自动跳转 HTTPS (Y)

---

## Step 8: 创建 Systemd 服务

```bash
nano /etc/systemd/system/planforge.service
```

粘贴以下内容：
```ini
[Unit]
Description=PlanForge Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/planforge
ExecStart=/usr/bin/node /var/www/planforge/src/app.ts
Restart=on-failure
Environment=NODE_ENV=production
EnvironmentFile=/var/www/planforge/.env

[Install]
WantedBy=multi-user.target
```

保存退出：`Ctrl+X` → `Y` → `Enter`

---

## Step 9: 启动服务

```bash
# 重载 systemd
systemctl daemon-reload

# 启用开机自启
systemctl enable planforge

# 启动服务
systemctl start planforge

# 检查状态
systemctl status planforge
```

看到 `active (running)` 表示成功！

---

## Step 10: 安全设置

### 10.1 设置数据文件权限
```bash
chmod 600 /var/www/planforge/data/*.json
chown -R www-data:www-data /var/www/planforge
```

### 10.2 配置防火墙
```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

---

## Step 11: 验证部署

### 11.1 测试 API
```bash
curl https://planforge.lucaslinn.cc.cd/api/sessions
```

应该返回：`{"sessions":[]}`

### 11.2 测试健康检查
```bash
curl https://planforge.lucaslinn.cc.cd/health
```

---

## 更新部署

当代码有更新时：

```bash
cd /var/www/planforge

# 拉取新代码（如果用 git）
# git pull

# 或者重新上传
# rsync -avz --exclude='node_modules' --exclude='.git' ./backend/ root@你的IP:/var/www/planforge/

# 重启服务
systemctl restart planforge
```

---

## 故障排查

### 查看服务日志
```bash
journalctl -u planforge -f
```

### 查看 Nginx 错误日志
```bash
tail -f /var/log/nginx/error.log
```

### 重启服务
```bash
systemctl restart planforge
systemctl reload nginx
```

### 常见问题

**1. 服务启动失败**
```bash
# 查看详细错误
node /var/www/planforge/src/app.ts
```

**2. SSL 证书过期**
```bash
certbot renew
```

**3. 端口被占用**
```bash
lsof -i :3001
kill <PID>
systemctl restart planforge
```

---

## 完成后

✅ 后端地址：`https://planforge.lucaslinn.cc.cd/api`

✅ 前端 Vercel 部署时，环境变量设置：
```
NUXT_PUBLIC_API_BASE_URL=https://planforge.lucaslinn.cc.cd
```
