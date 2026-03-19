# PlanForge

AI 智能需求分析与方案生成工具

## 简介

PlanForge 是一款强大的工具，帮助您将项目需求转化为详细、可执行的实施方案，基于 AI 智能辅助。

## 功能特点

- **智能需求分析**：自动分析和结构化您的项目需求
- **AI 智能支持**：支持多种 AI 提供商（OpenAI、Claude、MiniMax、自定义端点）
- **交互式问答**：通过引导式 AI 对话澄清需求
- **实施方案生成**：生成全面、详细的实施方案
- **导出选项**：支持 Markdown 格式导出，方便开发团队使用

## 技术栈

### 前端
- Nuxt 3 + Vue 3
- Tailwind CSS
- Pinia（状态管理）
- 支持亮色/暗色主题切换

### 后端
- Node.js + Express
- TypeScript
- OpenAI SDK
- 内存数据存储（可扩展）

## 项目结构

```
planforge/
├── frontend/          # 前端 Nuxt 应用
├── backend/           # 后端 API 服务器
├── docs/              # 项目文档
└── package.json       # 根 package.json (pnpm workspaces)
```

## 快速开始

### 前置要求

- Node.js 18+
- pnpm（推荐）或 npm

### 安装依赖

1. 安装所有依赖：

```bash
pnpm install
```

2. 配置环境变量：

```bash
# 后端
cp backend/.env.example backend/.env

# 前端
cp frontend/.env.example frontend/.env
```

### 开发模式

同时启动前端和后端：

```bash
pnpm dev
```

或分别启动：

```bash
# 后端（运行在 http://localhost:3001）
pnpm dev:backend

# 前端（运行在 http://localhost:3000）
pnpm dev:frontend
```

### 构建生产版本

构建两个应用：

```bash
pnpm build
```

## 配置说明

### AI 提供商设置

1. 在前端访问设置页面
2. 选择您的 AI 提供商（OpenAI、Claude、MiniMax 或自定义）
3. 输入您的 API 密钥
4. 选择或输入自定义模型名称

**注意**：您的 API 密钥存储在本地浏览器中，绝不会发送到我们的服务器。

## 支持的 AI 提供商

### OpenAI
- GPT-4o / GPT-4o Mini
- GPT-4 Turbo / GPT-4
- GPT-3.5 Turbo

### Claude (Anthropic)
- Claude Sonnet 4
- Claude 3.5 Sonnet / Haiku
- Claude 3 Opus / Sonnet / Haiku

### MiniMax
- MiniMax-Text-01
- ABAB 6.5S / 6.5G
- ABAB 5.5S

### 自定义端点
- 支持任何 OpenAI API 兼容的端点
- 支持本地 LLM
- 支持代理服务器

## 部署说明

### 前端部署
- 部署到 Vercel、Netlify 或任何静态托管服务

### 后端部署
- 部署到 Railway、Render 或任何 Node.js 托管服务
- 中国用户可使用腾讯云等平台

## 项目文档

详细文档请查看 [docs](./docs/) 目录或 [.trae/documents](./.trae/documents/) 目录。

## 许可证

MIT
