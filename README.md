# PlanForge

AI 智能需求分析与技术方案生成工具

[English](./README_EN.md) | 中文

---

## 简介

PlanForge 是一款基于 AI 的智能需求分析和方案生成工具。通过交互式问答对话，帮助用户将模糊的项目需求转化为详细、可执行的技术实施方案。

### 核心功能

- **交互式需求分析**：AI 通过引导式问答（选择题）澄清需求
- **流式响应输出**：实时显示 AI 生成内容，提供流畅的用户体验
- **多 AI 提供商支持**：OpenAI、MiniMax、Z.AI、自定义端点
- **完整方案生成**：基于需求和对话历史生成技术实施方案
- **Markdown 文档导出**：下载格式规范的技术文档
- **文件上传支持**：支持 txt、md、doc、docx 格式需求文档
- **深色/浅色主题**：支持明暗主题切换

---

## 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| Nuxt 3 | 3.14+ | Vue 3 全栈框架 |
| Vue 3 | 3.5+ | UI 框架 |
| Tailwind CSS | 3.4 | 原子化 CSS |
| Pinia | 2.2+ | 状态管理 |
| marked | 17.0+ | Markdown 渲染 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 运行环境 |
| Express | 4.21 | Web 框架 |
| TypeScript | 5.6 | 类型安全 |
| OpenAI SDK | 4.67+ | AI 接口调用 |
| Multer | 1.4.5 | 文件上传 |
| Zod | 3.23+ | 数据验证 |

---

## 项目结构

```
planforge/
├── frontend/                    # Nuxt 3 前端应用
│   ├── assets/                 # 静态资源
│   ├── layouts/                # 布局组件
│   ├── pages/                  # 页面路由
│   │   ├── index.vue           # 首页 - 需求分析与对话
│   │   └── config.vue          # 设置页 - AI 配置
│   ├── plugins/                # 插件
│   ├── stores/                 # Pinia 状态管理
│   ├── app.vue                 # 根组件
│   └── nuxt.config.ts          # Nuxt 配置
│
├── backend/                     # Express 后端 API
│   ├── src/
│   │   ├── controllers/         # 控制器
│   │   │   ├── chat.controller.ts      # 对话接口
│   │   │   ├── document.controller.ts  # 文档导出接口
│   │   │   └── requirement.controller.ts # 需求管理接口
│   │   ├── services/           # 业务逻辑
│   │   │   ├── ai.service.ts           # AI 服务封装
│   │   │   └── requirement.service.ts  # 需求服务
│   │   ├── prompts/            # AI 提示词模板
│   │   │   ├── analyzer.prompt.ts      # 分析提示词
│   │   │   ├── generator.prompt.ts      # 方案生成提示词
│   │   │   └── question.prompt.ts       # 问题生成提示词
│   │   ├── middleware/          # 中间件
│   │   ├── routes/             # 路由定义
│   │   ├── types/              # TypeScript 类型
│   │   ├── utils/              # 工具函数
│   │   └── app.ts              # 应用入口
│   └── package.json
│
├── package.json                # pnpm workspace 配置
└── pnpm-workspace.yaml         # 工作空间定义
```

---

## 快速开始

### 前置要求

- Node.js >= 18
- pnpm >= 8（推荐）或 npm

### 安装与启动

```bash
# 克隆项目
git clone https://gitee.com/chenxinlinn/planforge.git
cd planforge

# 安装依赖（根目录执行会安装所有子项目依赖）
pnpm install

# 启动开发服务器
pnpm dev
```

这将同时启动：
- **前端**: http://localhost:3000
- **后端 API**: http://localhost:3001

### 分别启动

```bash
# 仅启动后端
cd backend && pnpm dev

# 仅启动前端
cd frontend && pnpm dev
```

### 生产构建

```bash
# 构建所有项目
pnpm build

# 或分别构建
cd backend && pnpm build
cd frontend && pnpm build
```

---

## 使用指南

### 1. 配置 AI 提供商

1. 访问 http://localhost:3000/config
2. 选择 AI 提供商（MiniMax / Z.AI / OpenAI / 自定义）
3. 输入 API 密钥和模型名称
4. 点击保存

### 2. 创建需求分析

1. 在首页输入您的项目需求描述
2. 或点击上传按钮导入需求文档
3. 点击"开始对话"启动交互式需求分析

### 3. 交互式问答

- AI 会以选择题形式询问关键问题
- 选择最符合您需求的选项
- AI 根据回答进一步澄清细节

### 4. 生成技术方案

- 对话充分后，点击"生成完整技术方案"
- 系统会生成包含以下内容的方案：
  - 需求理解总结
  - 技术架构设计
  - 多个技术栈方案对比
  - 数据库设计建议
  - API 设计概要
  - 核心功能模块划分
  - 开发时间估算
- 方案将自动下载为 Markdown 文件

---

## API 接口

### 基础信息

- **Base URL**: `http://localhost:3001/api`
- **认证方式**: Header 参数

### 请求头

```
X-API-Provider: minimax | zai | openai | custom
X-API-Key: your-api-key
X-API-Model: your-model-name
X-API-BaseURL: (可选) custom-api-endpoint
```

### 接口列表

#### 需求管理

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /requirements | 创建需求 |
| GET | /requirements/:id | 获取需求详情 |
| PUT | /requirements/:id | 更新需求 |
| DELETE | /requirements/:id | 删除需求 |
| POST | /requirements/:id/analyze | 分析需求 |
| POST | /requirements/:id/upload | 上传需求文档 |

#### 对话会话

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /sessions/chat | 发送对话消息（流式） |
| POST | /sessions/generate-solution | 生成技术方案（流式） |
| GET | /sessions/history/:requirementId | 获取对话历史 |

#### 文档导出

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /generate/analysis | 生成需求分析文档 |
| POST | /generate/questions | 生成问题列表 |
| POST | /generate/solution | 生成技术方案文档 |
| POST | /export/markdown | 导出 Markdown |

---

## 配置说明

### 环境变量

**后端 (.env)**
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**前端 (.env)**
```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### AI 提供商配置

#### MiniMax
```typescript
Provider: minimax
BaseURL: https://api.minimaxi.com/v1 (自动设置)
Model: MiniMax-Text-01 / abab6.5s-chat
```

#### Z.AI (智谱 GLM)
```typescript
Provider: zai
BaseURL: https://open.bigmodel.cn/api/paas/v4/chat/completions (自动设置)
Model: glm-4-flash / glm-4-plus
```

#### OpenAI 兼容
```typescript
Provider: custom
BaseURL: 您的自定义端点
Model: gpt-4 / claude-3-sonnet
```

---

## 开发指南

### 添加新的 AI 提供商

1. 在 `backend/src/services/ai.service.ts` 中添加提供商配置
2. 更新 `X-API-Provider` Header 的类型定义
3. 在前端 `stores/config.ts` 中添加选项

### 自定义提示词

编辑 `backend/src/prompts/` 目录下的提示词文件：
- `analyzer.prompt.ts` - 需求分析对话
- `generator.prompt.ts` - 技术方案生成
- `question.prompt.ts` - 问题生成

### 添加新页面

1. 在 `frontend/pages/` 创建 `.vue` 文件
2. 使用 `definePageMeta` 定义页面元信息
3. 使用 `useRuntimeConfig` 访问配置

---

## 部署

### Docker 部署

```dockerfile
# 后端
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install -g pnpm && pnpm install
COPY . .
EXPOSE 3001
CMD ["pnpm", "dev"]

# 前端 (SSR)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### 主流平台部署

| 平台 | 推荐配置 |
|------|----------|
| Vercel | 前端静态部署 |
| Railway | 后端 Node.js 部署 |
| Render | 后端服务 |
| 腾讯云 | 中国区部署 |

---

## 常见问题

**Q: API 请求超时怎么办？**
A: 检查网络连接，确认 AI 提供商服务可用，适当增加请求超时时间。

**Q: 如何切换深色主题？**
A: 页面右上角有主题切换按钮，点击即可切换。

**Q: 支持哪些文件格式？**
A: 目前支持 txt、md、doc、docx 格式的需求文档上传。

---

## License

MIT License - 详见 [LICENSE](./LICENSE) 文件

---

## 致谢

- [Nuxt Team](https://nuxt.com/) - Vue 3 全栈框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [OpenAI](https://openai.com/) - AI 接口支持
