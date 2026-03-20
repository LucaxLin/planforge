# PlanForge Backend API

AI 智能需求分析与方案生成后端服务

---

## 简介

PlanForge 后端 API 提供需求管理、对话会话、技术方案生成等核心功能。支持流式响应输出，兼容多种 AI 提供商（MiniMax、Z.AI、OpenAI 等）。

---

## 技术栈

- **Runtime**: Node.js >= 18
- **Framework**: Express 4.21
- **Language**: TypeScript 5.6
- **AI SDK**: OpenAI SDK 4.67+
- **File Upload**: Multer 1.4.5
- **Validation**: Zod 3.23+
- **Development**: tsx watch

---

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

服务启动后运行在 http://localhost:3001

### 构建生产版本

```bash
pnpm build
pnpm start
```

---

## 项目结构

```
backend/
├── src/
│   ├── app.ts                    # 应用入口
│   ├── config/
│   │   └── index.ts             # 配置管理
│   ├── controllers/              # 控制器
│   │   ├── chat.controller.ts   # 对话会话
│   │   ├── document.controller.ts # 文档导出
│   │   └── requirement.controller.ts # 需求管理
│   ├── middleware/              # 中间件
│   │   ├── error.middleware.ts   # 错误处理
│   │   └── upload.middleware.ts  # 文件上传
│   ├── prompts/                 # AI 提示词
│   │   ├── analyzer.prompt.ts    # 需求分析
│   │   ├── generator.prompt.ts   # 方案生成
│   │   └── question.prompt.ts    # 问题生成
│   ├── routes/                  # 路由定义
│   │   ├── index.ts
│   │   ├── chat.routes.ts
│   │   ├── document.routes.ts
│   │   └── requirement.routes.ts
│   ├── services/                # 业务逻辑
│   │   ├── ai.service.ts        # AI 服务封装
│   │   └── requirement.service.ts # 需求服务
│   ├── types/                   # 类型定义
│   │   └── index.ts
│   └── utils/                   # 工具函数
│       ├── logger.ts           # 日志
│       └── validator.ts        # 验证器
│
├── .env.example                 # 环境变量示例
├── package.json
└── tsconfig.json
```

---

## API 接口

### 基础信息

- **Base URL**: `http://localhost:3001/api`
- **Content-Type**: `application/json` 或 `multipart/form-data`

### 认证方式

所有 AI 相关接口需要通过 Header 传递配置：

```
X-API-Provider: minimax | zai | openai | custom
X-API-Key: your-api-key
X-API-Model: your-model-name
X-API-BaseURL: (可选) 自定义端点
```

### 路由列表

#### 健康检查

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /health | 服务健康检查 |

#### 需求管理 `/api/requirements`

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | / | 创建需求 |
| GET | /:id | 获取需求详情 |
| PUT | /:id | 更新需求 |
| DELETE | /:id | 删除需求 |
| POST | /:id/analyze | 分析需求 |
| POST | /:id/upload | 上传需求文档 |

#### 对话会话 `/api/sessions`

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /chat | 发送对话消息（SSE 流式） |
| POST | /generate-solution | 生成技术方案（SSE 流式） |
| GET | /history/:requirementId | 获取对话历史 |

#### 文档导出 `/api`

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /generate/analysis | 生成需求分析 |
| POST | /generate/questions | 生成问题列表 |
| POST | /generate/solution | 生成技术方案 |
| POST | /export/markdown | 导出 Markdown |

---

## 接口详情

### 创建需求

```http
POST /api/requirements
Content-Type: multipart/form-data

title: 我的项目需求
content: 项目需求描述文本
```

响应：
```json
{
  "id": "uuid-v4",
  "title": "我的项目需求",
  "content": "项目需求描述文本",
  "type": "text",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 对话聊天（流式）

```http
POST /api/sessions/chat
Content-Type: application/json

{
  "requirementId": "uuid-v4",
  "message": "用户回复内容"
}
```

响应：SSE 流式数据
```
data: {"content": "AI", "done": false}

data: {"content": "回复", "done": false}

data: {"done": true, "history": [...]}
```

### 生成技术方案（流式）

```http
POST /api/sessions/generate-solution
Content-Type: application/json

{
  "requirementId": "uuid-v4"
}
```

响应：SSE 流式数据，生成完成后自动添加完整性验证标识。

### 导出 Markdown

```http
POST /api/export/markdown
Content-Type: application/json

{
  "requirementId": "uuid-v4"
}
```

响应：Markdown 格式文件下载

---

## AI 服务

### AI 配置提取

从请求 Header 提取 AI 配置：

```typescript
interface AIConfig {
  provider: 'minimax' | 'zai' | 'openai' | 'custom';
  apiKey: string;
  baseURL?: string;
  model: string;
}
```

### 支持的提供商

#### MiniMax
- 默认端点：`https://api.minimaxi.com/v1`
- 推荐模型：`MiniMax-Text-01`, `abab6.5s-chat`

#### Z.AI (智谱 GLM)
- 默认端点：`https://open.bigmodel.cn/api/paas/v4/chat/completions`
- 推荐模型：`glm-4-flash`, `glm-4-plus`

#### OpenAI 兼容
- 支持任何 OpenAI API 兼容端点
- 支持本地 LLM
- 支持代理服务器

### 流式输出

AI 服务支持 SSE (Server-Sent Events) 流式输出：

```typescript
async *chatStream(
  messages: Message[],
  systemPrompt?: string
): AsyncGenerator<string, void, unknown>
```

---

## 提示词模板

### 分析提示词 (analyzer.prompt.ts)

用于交互式需求分析对话，引导用户通过选择题澄清需求。

### 生成提示词 (generator.prompt.ts)

用于基于需求和对话历史生成完整技术方案。

### 问题提示词 (question.prompt.ts)

用于生成引导性问题列表。

---

## 中间件

### 错误处理 (error.middleware.ts)

统一错误处理和响应格式：

```json
{
  "error": "Error Type",
  "message": "错误描述",
  "statusCode": 400
}
```

### 文件上传 (upload.middleware.ts)

支持的文件格式：
- `.txt` - 纯文本
- `.md` - Markdown
- `.doc` / `.docx` - Word 文档

---

## 环境变量

创建 `.env` 文件：

```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

---

## 开发指南

### 添加新的 AI 提供商

1. 在 `src/services/ai.service.ts` 中更新 `configure()` 方法
2. 添加对应的默认端点和配置
3. 更新类型定义

### 添加新的路由

1. 在对应 controller 中实现处理函数
2. 在 `src/routes/` 中定义路由
3. 在 `src/app.ts` 中注册路由

### 调试

开发模式使用 `tsx watch`，支持热重载。

日志输出到控制台，包含请求路径、IP、User-Agent 等信息。

---

## License

MIT
