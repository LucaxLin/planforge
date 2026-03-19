# PlanForge 项目实施计划（最终版）

## 📋 项目概述

**项目名称**: PlanForge  
**项目类型**: 前后端分离的智能需求分析和方案生成工具  
**核心功能**: 接收用户需求文档/文字 → AI 深度分析 → 引导式对话完善 → 生成可落地技术方案  

---

## 🏗️ 一、技术架构（最终确认）

### 1.1 整体架构
```
┌─────────────────────┐     REST API      ┌─────────────────────┐
│   Frontend          │ ←──────────────→ │   Backend           │
│   (Nuxt 3 + Vite)  │    JSON/HTTP     │   (Node.js)         │
│                     │                  │                     │
│  - UI 样式         │                  │  - AI 调用          │
│  - 用户交互        │                  │  - 业务逻辑         │
│  - localStorage    │  API Key + Key   │  - 数据处理（内存） │
│    (用户配置)       │  in every req    │                     │
└─────────────────────┘                  └─────────────────────┘
```

### 1.2 技术栈详情

#### 前端技术栈
| 类别 | 技术选型 | 说明 |
|------|---------|------|
| 框架 | Nuxt 3 | Vue 3 服务端渲染框架 |
| 构建工具 | Vite | 快速开发体验 |
| UI 库 | Nuxt UI / TailwindCSS | 现代、轻量级 UI |
| 状态管理 | Pinia | Vue 3 推荐状态管理 |
| HTTP 客户端 | $fetch | Nuxt 内置 |
| 样式 | Tailwind CSS | 原子化 CSS |
| Markdown 编辑器 | @milkdown/vue | 需求输入 |
| 存储 | localStorage | 存储用户 API Key |

#### 后端技术栈
| 类别 | 技术选型 | 说明 |
|------|---------|------|
| 运行环境 | Node.js 18+ | JavaScript 运行时 |
| 框架 | Express / Fastify | 轻量 REST API 框架 |
| AI 集成 | OpenAI SDK / LangChain | AI 模型调用 |
| 文件处理 | Multer | 文件上传 |
| 环境配置 | dotenv | 环境变量管理 |
| 日志 | Winston / Pino | 结构化日志 |
| 验证 | Zod | 类型安全验证 |
| 数据库 | SQLite（免费）/ 内存 | 开发阶段使用 |

---

## 📁 二、代码仓库结构（最终确认）

### 方案：单一仓库，双目录
```
planforge/                          # Git 仓库根目录
├── frontend/                      # 前端项目
│   ├── src/
│   │   ├── assets/               # 静态资源
│   │   ├── components/           # Vue 组件
│   │   │   ├── common/          # 通用组件
│   │   │   ├── editor/          # 编辑器组件
│   │   │   ├── chat/            # 对话组件
│   │   │   └── output/          # 输出展示组件
│   │   ├── composables/         # 组合式函数
│   │   ├── layouts/             # 页面布局
│   │   ├── pages/               # 页面
│   │   ├── plugins/             # Nuxt 插件
│   │   ├── stores/              # Pinia 状态
│   │   ├── types/               # TypeScript 类型
│   │   ├── utils/               # 工具函数
│   │   ├── app.vue
│   │   └── nuxt.config.ts
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── backend/                       # 后端项目
│   ├── src/
│   │   ├── config/              # 配置文件
│   │   ├── controllers/         # 控制器
│   │   │   ├── requirement.controller.ts
│   │   │   ├── chat.controller.ts
│   │   │   └── document.controller.ts
│   │   ├── services/            # 业务逻辑
│   │   │   ├── requirement.service.ts
│   │   │   ├── ai.service.ts    # AI 调用核心
│   │   │   └── document.service.ts
│   │   ├── models/              # 数据模型（内存/SQLite）
│   │   │   ├── requirement.model.ts
│   │   │   └── session.model.ts
│   │   ├── routes/              # 路由
│   │   │   ├── index.ts
│   │   │   ├── requirement.routes.ts
│   │   │   ├── chat.routes.ts
│   │   │   └── document.routes.ts
│   │   ├── middleware/          # 中间件
│   │   │   ├── error.middleware.ts
│   │   │   └── upload.middleware.ts
│   │   ├── prompts/             # AI 提示词模板
│   │   │   ├── analyzer.prompt.ts
│   │   │   ├── question.prompt.ts
│   │   │   └── generator.prompt.ts
│   │   ├── utils/               # 工具函数
│   │   │   ├── logger.ts
│   │   │   └── validator.ts
│   │   ├── types/               # TypeScript 类型
│   │   └── app.ts              # 应用入口
│   ├── tests/                   # 测试
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── docs/                         # 项目文档
├── .gitignore
├── package.json                  # 根 package.json（pnpm workspaces）
├── pnpm-workspace.yaml           # pnpm 工作空间配置
└── README.md
```

---

## 🔐 三、安全与存储方案（最终确认）

### 3.1 API Key 存储方案
- **存储位置**: 用户浏览器 localStorage
- **传输方式**: 每个请求的 Header 中携带
- **安全措施**: HTTPS 传输，后端不存储密钥

```typescript
// 前端请求示例
const headers = {
  'Content-Type': 'application/json',
  'X-API-Provider': 'openai',
  'X-API-Key': userApiKey,        // 从 localStorage 读取
  'X-API-BaseURL': baseURL,       // 可选，自定义端点
  'X-API-Model': model           // 模型名称
}
```

### 3.2 数据存储策略
- **阶段 1（当前）**: 完全使用内存存储
- **未来扩展**: 可轻松迁移到 SQLite 或 PostgreSQL
- **会话管理**: 基于内存 Map，数据不持久化

### 3.3 预留功能
```typescript
// 用户认证预留接口（暂不实现）
POST   /api/auth/register        // 注册（预留）
POST   /api/auth/login           // 登录（预留）
POST   /api/auth/logout           // 登出（预留）
```

---

## 🔌 四、API 接口设计

### 4.1 核心接口

#### 需求管理
```typescript
POST   /api/requirements         // 创建需求
GET    /api/requirements/:id     // 获取需求详情
PUT    /api/requirements/:id     // 更新需求
DELETE /api/requirements/:id     // 删除需求
POST   /api/requirements/:id/upload  // 上传文档
```

#### 对话管理
```typescript
POST   /api/sessions             // 创建会话
GET    /api/sessions/:id         // 获取会话
POST   /api/sessions/:id/messages  // 发送消息
GET    /api/sessions/:id/messages  // 获取消息历史
```

#### 方案生成
```typescript
POST   /api/generate/analysis    // 生成分析
POST   /api/generate/questions   // 生成引导问题
POST   /api/generate/solution    // 生成完整方案
POST   /api/export/markdown      // 导出 Markdown
```

#### 用户配置（前端控制，后端透传）
```typescript
// API Key 由前端存储，每次请求携带
// 后端透传到对应 AI 服务商
```

### 4.2 请求头规范
```typescript
// 所有请求必须携带
Headers:
{
  'X-API-Provider': 'openai' | 'claude' | 'custom',
  'X-API-Key': string,
  'X-API-BaseURL': string (optional),
  'X-API-Model': string
}
```

---

## 🎯 五、核心功能模块

### 5.1 前端模块（frontend/）

#### 1. 需求输入模块
- **富文本编辑器**: 支持 Markdown 编写
- **文件上传**: 支持 .txt, .md, .docx, .pdf
- **模板系统**: 预设常见需求模板
- **实时预览**: Markdown 实时渲染

#### 2. 配置管理模块
- **API Key 管理**: 安全输入和存储用户密钥
- **模型选择**: 支持 OpenAI / Claude / 自定义
- **参数调整**: Temperature, Max Tokens 等
- **持久化**: localStorage

#### 3. 对话交互模块
- **多轮对话**: 支持连续对话和上下文
- **问题卡片**: 清晰展示 AI 提出的问题
- **快速回复**: 预设选项快速响应
- **进度指示**: 显示分析/生成进度

#### 4. 方案展示模块
- **分栏布局**: 左侧需求，右侧方案
- **代码高亮**: 技术栈代码示例
- **导出功能**: 一键复制或下载 Markdown
- **版本对比**: 支持方案迭代对比

### 5.2 后端模块（backend/）

#### 1. AI 核心服务 (ai.service.ts)
```typescript
class AIService {
  // 统一入口，透传请求到对应 AI 服务商
  async chat(messages: Message[], config: AIConfig): Promise<Response>
  
  // OpenAI
  async callOpenAI(messages: Message[], apiKey: string, model: string): Promise<Response>
  
  // Claude
  async callClaude(messages: Message[], apiKey: string, model: string): Promise<Response>
  
  // 自定义端点（支持本地模型）
  async callCustom(messages: Message[], baseURL: string, apiKey: string, model: string): Promise<Response>
  
  // 流式响应
  async chatStream(messages: Message[], config: AIConfig): Promise<Stream>
}
```

#### 2. 需求分析服务 (requirement.service.ts)
```typescript
class RequirementService {
  // 初步分析
  async analyzeRequirement(content: string, aiConfig: AIConfig): Promise<AnalysisResult>
  
  // 提取关键要素
  extractEntities(content: string): string[]
  extractConstraints(content: string): Constraint[]
  identifyTechStack(content: string): TechSuggestion[]
  
  // 生成澄清问题
  generateClarifyingQuestions(analysis: AnalysisResult, aiConfig: AIConfig): Question[]
  
  // 生成完整方案
  generateSolution(context: SessionContext, aiConfig: AIConfig): Promise<Solution>
}
```

#### 3. 提示词管理 (prompts/)
- `analyzer.prompt.ts`: 需求分析提示词
- `question.prompt.ts`: 问题生成提示词
- `generator.prompt.ts`: 方案生成提示词
- `refiner.prompt.ts`: 方案优化提示词

---

## 🚀 六、实施步骤（精简版）

### 第一阶段：项目初始化 (Day 1)

#### 1. 目录结构搭建
```bash
planforge/
├── frontend/
└── backend/
```

#### 2. 后端初始化
- [ ] 初始化 Node.js 项目
- [ ] 配置 TypeScript
- [ ] 搭建 Express 基础结构
- [ ] 实现 AI 服务核心

#### 3. 前端初始化
- [ ] 初始化 Nuxt 3 项目
- [ ] 配置 Tailwind CSS
- [ ] 搭建基础组件

### 第二阶段：核心功能开发 (Day 2-5)

#### 1. 后端核心
- [ ] AI 服务实现（OpenAI/Claude/自定义）
- [ ] 需求分析服务
- [ ] 对话会话管理
- [ ] 提示词系统

#### 2. 前端核心
- [ ] 需求输入界面
- [ ] API Key 配置页面
- [ ] 对话交互界面
- [ ] 方案展示页面

### 第三阶段：集成与优化 (Day 6-7)

#### 1. 前后端对接
- [ ] API 对接
- [ ] 错误处理
- [ ] 样式优化

#### 2. 部署准备
- [ ] 前端：Vercel 部署
- [ ] 后端：Railway/Render/腾讯云

---

## ☁️ 七、部署方案（最终确认）

### 7.1 前端部署
- **平台**: Vercel
- **优势**: 免费、Nuxt 原生支持、自动部署
- **配置**: `frontend/` 作为部署目录

### 7.2 后端部署
- **首选**: Railway（免费层，支持 Node.js）
- **备选**: Render（免费层）
- **备选**: 腾讯云（SCF/轻量应用服务器）

### 7.3 环境变量
```bash
# 前端 (.env)
NUXT_PUBLIC_API_BASE_URL=https://api.planforge.com

# 后端 (.env)
PORT=3001
NODE_ENV=production
# AI API Keys 由用户自己提供，不在后端存储
```

---

## 🎯 八、里程碑

| 阶段 | 目标 | 交付物 |
|------|------|--------|
| M1 | 基础框架搭建 | 可运行的前后端项目 |
| M2 | AI 调用核心 | 支持多模型的 AI 服务 |
| M3 | 基础对话功能 | 需求输入 + AI 分析 + 简单对话 |
| M4 | 完整流程 | 引导式对话 + 方案生成 + 导出 |
| M5 | 部署上线 | Vercel + Railway/腾讯云 |

---

## ✅ 九、确认清单

- [x] 技术栈：Nuxt 3 + Node.js
- [x] 代码结构：frontend/ + backend/ 双目录
- [x] 数据库：内存存储（SQLite 预留）
- [x] 用户认证：预留接口，暂不实现
- [x] API Key：存储在 localStorage，每次请求携带
- [x] 部署：前端 Vercel，后端 Railway/腾讯云
- [ ] 开始实施？

---

## 🚀 十、下一步行动

准备就绪后，我将立即开始：

1. **创建目录结构**
   - 创建 `frontend/` 和 `backend/` 目录

2. **初始化后端项目**
   - Node.js + Express + TypeScript
   - AI 服务核心实现

3. **初始化前端项目**
   - Nuxt 3 + Tailwind CSS
   - 基础组件和页面

准备好开始了吗？
