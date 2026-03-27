# PlanForge 注册功能设置指南

## 📋 功能概述

已实现邮箱注册功能，包含：
- ✅ 图形验证码（防止机器注册）
- ✅ 邮箱验证码（确保邮箱真实有效）
- ✅ 密码强度验证
- ✅ 确认密码校验
- ✅ JWT Token 认证

---

## 🚀 快速开始

### 第一步：安装后端依赖

在 `backend` 目录下运行：

```bash
cd backend
npm install nodemailer svg-captcha bcryptjs
npm install -D @types/nodemailer @types/svg-captcha @types/bcryptjs
```

### 第二步：配置邮件服务

编辑 `backend/.env.prod` 文件，从以下方案中选择一个：

#### 方案1：QQ邮箱（⭐推荐国内使用）

```env
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-qq@qq.com
SMTP_PASS=your-authorization-code
EMAIL_FROM=PlanForge <your-qq@qq.com>
```

**获取授权码步骤：**
1. 登录 [mail.qq.com](https://mail.qq.com)
2. 点击 **设置** → **账户**
3. 找到 **POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务**
4. 开启 **SMTP服务**
5. 点击 **生成授权码**（会发送短信验证）
6. 复制授权码到 `SMTP_PASS`

---

#### 方案2：网易邮箱（163/126）

```env
SMTP_HOST=smtp.163.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@163.com
SMTP_PASS=your-authorization-code
EMAIL_FROM=PlanForge <your-email@163.com>
```

**获取授权码步骤：**
1. 登录 [mail.163.com](https://mail.163.com)
2. 点击 **设置** → **POP3/SMTP/IMAP**
3. 开启 **SMTP服务**
4. 点击 **授权码管理** → **生成授权码**
5. 复制授权码到 `SMTP_PASS`

---

#### 方案3：新浪邮箱

```env
SMTP_HOST=smtp.vip.sina.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@sina.com
SMTP_PASS=your-authorization-code
EMAIL_FROM=PlanForge <your-email@sina.com>
```

**获取授权码步骤：**
1. 登录 [mail.sina.com](https://mail.sina.com)
2. 点击 **设置** → **账户**
3. 开启 **SMTP服务**
4. 生成授权码

---

#### 方案4：Gmail（国外服务器推荐）

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=PlanForge <your-email@gmail.com>
```

⚠️ **注意**：Gmail 在国内可能无法访问，仅限国外服务器使用。

**获取应用密码步骤：**
1. 登录 Google 账户
2. 进入 **Google 账户** → **安全性**
3. 开启 **两步验证**
4. 找到 **应用专用密码**
5. 生成新的应用密码

---

### 第三步：配置对比表

| 服务商 | SMTP地址 | 端口 | 安全性 | 国内可用 | 推荐度 |
|--------|----------|------|--------|----------|--------|
| **QQ邮箱** | smtp.qq.com | 587 | ⭐⭐⭐⭐⭐ | ✅ | ⭐⭐⭐⭐⭐ |
| **网易邮箱** | smtp.163.com | 587 | ⭐⭐⭐⭐⭐ | ✅ | ⭐⭐⭐⭐ |
| **新浪邮箱** | smtp.vip.sina.com | 587 | ⭐⭐⭐⭐ | ✅ | ⭐⭐⭐ |
| **Gmail** | smtp.gmail.com | 587 | ⭐⭐⭐⭐⭐ | ❌ | ⭐⭐ |

---

### 第四步：重启后端服务

```bash
# 开发环境
cd backend
npm run dev

# 生产环境
npm run build
npm start
```

### 第五步：测试注册功能

1. 访问 `http://localhost:3000/register`（前端地址）
2. 填写邮箱、密码、确认密码
3. 输入图形验证码
4. 点击"获取验证码"
5. 查收邮件，输入邮箱验证码
6. 完成注册

---

## ⚠️ 常见问题与解决方案

### 问题1：QQ邮箱发送失败

**错误信息**：`Authentication failed`

**原因**：授权码错误或未开启SMTP服务

**解决方案**：
1. 确认授权码正确（注意不要有空格）
2. 确认已开启 SMTP 服务
3. 如果使用了"客户端专用密码"，请改用"授权码"
4. 授权码区分大小写，请完整复制

---

### 问题2：邮箱收不到验证码

**可能原因**：
1. 邮件被邮箱拦截/归类到垃圾邮件
2. SMTP配置错误
3. 邮箱地址输入错误

**解决方案**：
1. 检查垃圾邮件箱
2. 检查 SMTP 配置是否正确
3. 确认邮箱地址无误
4. 尝试使用其他邮箱测试

---

### 问题3：QQ邮箱提示"登录过于频繁"

**原因**：QQ邮箱有发送频率限制

**解决方案**：
1. 等待 15-30 分钟后再试
2. 使用企业邮箱或专业邮件服务
3. 降低发送频率

---

### 问题4：163邮箱授权码获取失败

**解决方案**：
1. 确保使用的是**授权码**而非登录密码
2. 部分邮箱需要先开通会员才能获取授权码
3. 可以使用**客户端授权码**替代

---

## 💡 专业方案推荐（可选）

如果用户量较大，建议使用专业邮件服务：

### 1. SendGrid（国外）
- **免费额度**：每月 100 封
- **优点**：国际通用，稳定
- **缺点**：国内访问慢

### 2. Mailgun（国外）
- **免费额度**：每月 5,000 封
- **优点**：免费额度大
- **缺点**：国内访问慢

### 3. 阿里云邮件推送（国内）
- **免费额度**：每月 1,000 封
- **优点**：国内访问快，稳定
- **缺点**：需要阿里云账号

### 4. 腾讯企业邮箱（国内）
- **免费额度**：有限，但很稳定
- **优点**：与QQ邮箱同源，国内访问快
- **缺点**：需要企业身份

---

## 🔧 测试邮件发送

在安装依赖后，可以使用以下脚本测试邮件配置：

```javascript
// test-email.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-qq@qq.com',
    pass: 'your-authorization-code',
  },
});

async function testEmail() {
  try {
    await transporter.sendMail({
      from: '"PlanForge" <your-qq@qq.com>',
      to: 'test@example.com',
      subject: '测试邮件',
      text: '这是一封测试邮件',
    });
    console.log('✅ 邮件发送成功！');
  } catch (error) {
    console.error('❌ 邮件发送失败：', error.message);
  }
}

testEmail();
```

运行：
```bash
node test-email.js
```

---

## 📊 发送限制说明

不同邮件服务有不同的发送限制：

| 服务商 | 每日限制 | 每小时限制 | 说明 |
|--------|----------|------------|------|
| QQ邮箱 | 500封 | 30封 | 普通账户 |
| 163邮箱 | 500封 | 50封 | 需授权码 |
| 新浪邮箱 | 100封 | 20封 | 免费账户 |
| Gmail | 500封 | 50封 | 需要应用密码 |

**建议**：
- 验证码邮件通常量不大，完全够用
- 如果用户量超过限制，升级到付费版本或使用专业服务

---

## 🛡️ 安全建议

1. **不要使用个人邮箱密码**
   - 使用授权码/App密码，而非登录密码
   - 定期更换授权码

2. **保护环境变量**
   - 不要将 `.env.prod` 提交到 Git
   - 使用 `.gitignore` 排除敏感文件

3. **监控邮件发送**
   - 定期检查发送日志
   - 监控异常发送行为

4. **限制发送频率**
   - 同一邮箱 60 秒内只能发送一次
   - 验证码 10 分钟后过期

---

## 📁 创建的文件

### 后端文件

1. **配置更新**
   - `backend/.env.prod` - 添加多种邮件服务商配置
   - `backend/src/config/index.ts` - 添加配置项

2. **服务层**
   - `backend/src/services/captcha.service.ts` - 图形验证码服务
   - `backend/src/services/email.service.ts` - 邮件发送服务
   - `backend/src/services/database.service.ts` - 扩展用户表

3. **控制器和路由**
   - `backend/src/controllers/auth.controller.ts` - 认证控制器
   - `backend/src/routes/auth.routes.ts` - 认证路由

### 前端文件

1. **页面**
   - `frontend/pages/register.vue` - 注册页面
   - `frontend/pages/login.vue` - 登录页面（预留）

---

## 🎨 界面预览

注册页面包含：
- 📧 邮箱输入框
- 🔒 密码输入框
- 🔒 确认密码输入框
- 🖼️ 图形验证码（可点击刷新）
- ✉️ 邮箱验证码输入框
- ⏱️ 倒计时按钮
- 📝 表单验证和错误提示

---

## 📝 后续功能建议

1. **登录功能** - 实现邮箱+验证码登录
2. **密码重置** - 添加忘记密码功能
3. **邮箱验证** - 注册后发送邮箱验证链接
4. **登录日志** - 记录登录历史
5. **限流保护** - 防止暴力破解

---

## 📞 获取帮助

如果遇到问题，请：
1. 检查控制台错误信息
2. 查看后端日志
3. 确认环境变量配置
4. 查看本文档的故障排除部分

**推荐配置顺序**：
1. QQ邮箱（最简单，推荐新手）
2. 网易邮箱（稳定）
3. 新浪邮箱（备选）
4. 专业服务（用户量大时）

祝你使用愉快！ 🎉
