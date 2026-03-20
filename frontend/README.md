# PlanForge Frontend

AI 智能需求分析与方案生成前端应用

---

## 简介

PlanForge 前端是基于 Nuxt 3 构建的 Web 应用，提供交互式需求分析和对话功能。界面简洁美观，支持深色/浅色主题切换，Markdown 实时渲染。

---

## 技术栈

- **Framework**: Nuxt 3.14+
- **UI**: Vue 3.5+
- **Styling**: Tailwind CSS 3.4
- **State**: Pinia 2.2+
- **Markdown**: marked 17.0+
- **DevTools**: @nuxt/devtools 1.6+

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

应用启动后运行在 http://localhost:3000

### 生产构建

```bash
pnpm build
pnpm preview
```

---

## 项目结构

```
frontend/
├── assets/                      # 静态资源
│   └── css/
│       └── main.css            # Tailwind 入口
│
├── layouts/                     # 布局组件
│   └── default.vue            # 默认布局（含导航栏）
│
├── pages/                       # 页面路由
│   ├── index.vue               # 首页 - 需求分析与对话
│   └── config.vue              # 设置页 - AI 配置
│
├── plugins/                     # 插件
│   └── init.client.ts          # 客户端初始化
│
├── stores/                      # Pinia 状态管理
│   ├── config.ts               # AI 配置状态
│   └── theme.ts                # 主题状态
│
├── app.vue                      # 根组件
├── nuxt.config.ts               # Nuxt 配置
├── tailwind.config.ts           # Tailwind 配置
└── package.json
```

---

## 页面说明

### 首页 (/)

主要功能区域：

1. **标题区域**
   - 应用标题：AI 智能需求分析
   - 副标题：通过问答对话，精准理解您的需求

2. **未配置 API 提示**
   - 当未配置 AI 时显示
   - 提供前往设置页面的链接

3. **需求输入区域**
   - 文本输入框：输入项目需求描述
   - 文件上传：支持 txt、md、doc、docx 格式
   - 开始对话按钮

4. **对话界面**（启动对话后显示）
   - 对话消息列表（支持 Markdown 渲染）
   - 消息气泡：用户消息（蓝色）和 AI 消息（灰色）
   - 实时流式输出效果
   - 输入框发送新消息
   - 生成完整技术方案按钮

5. **方案预览区域**（生成方案时显示）
   - 实时预览生成进度
   - 字符计数
   - 进度条动画
   - Markdown 内容实时渲染

### 设置页 (/config)

1. **AI 提供商选择**
   - MiniMax
   - Z.AI (智谱 GLM)
   - OpenAI / 自定义

2. **API 配置**
   - API 密钥输入
   - 模型名称输入
   - 自定义端点（可选）

3. **保存功能**
   - 配置保存到本地存储
   - 密钥不会发送到服务器

---

## 状态管理

### Config Store

```typescript
interface ConfigState {
  provider: 'minimax' | 'zai' | 'openai' | 'custom'
  apiKey: string
  baseURL: string
  model: string
}
```

- 持久化存储到 localStorage
- 页面加载时自动恢复

### Theme Store

```typescript
interface ThemeState {
  isDark: boolean
}
```

- 支持深色/浅色主题切换
- 跟随系统偏好设置

---

## 样式定制

### Tailwind 配置

自定义颜色扩展：

```typescript
colors: {
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    // ... 9 个色阶
  }
}
```

### 暗色模式

使用 `dark:` 前缀实现暗色样式：

```vue
<div class="bg-white dark:bg-gray-800">
  <p class="text-gray-900 dark:text-white">深色模式文字</p>
</div>
```

---

## 组件样式

### Markdown 渲染

支持完整的 Markdown 语法：

- 标题（h1-h3）
- 段落和换行
- 列表（有序/无序）
- 代码块和行内代码
- 表格（带样式）
- 引用块
- 粗体和斜体

### 滚动条样式

自定义滚动条适配深色模式：

```css
.chat-scroll::-webkit-scrollbar {
  width: 6px;
}

.chat-scroll::-webkit-scrollbar-thumb {
  background-color: #d1d5db; /* 浅色 */
}

.dark .chat-scroll::-webkit-scrollbar-thumb {
  background-color: #4b5563; /* 深色 */
}
```

---

## API 集成

### 运行环境配置

```typescript
runtimeConfig: {
  public: {
    apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'
  }
}
```

### 请求示例

```typescript
const response = await $fetch('/sessions/chat', {
  method: 'POST',
  baseURL: config.public.apiBaseUrl,
  headers: {
    'X-API-Provider': configStore.provider,
    'X-API-Key': configStore.apiKey,
    'X-API-Model': configStore.model,
  },
  body: {
    requirementId: id,
    message: content,
  },
})
```

### 流式请求

使用 Fetch API 接收 SSE 流：

```typescript
const response = await fetch(`${apiBaseUrl}/sessions/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ... },
  body: JSON.stringify(data),
})

const reader = response.body?.getReader()
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  const chunk = new TextDecoder().decode(value)
  // 处理流数据
}
```

---

## 开发指南

### 添加新页面

1. 在 `pages/` 目录创建 `.vue` 文件
2. 使用 `definePageMeta` 定义元信息：

```vue
<script setup>
definePageMeta({
  title: '页面标题'
})
</script>
```

### 添加新组件

1. 创建组件文件
2. 在页面中导入使用
3. 支持自动导入（Nuxt 约定）

### 添加新状态

在 `stores/` 目录创建 Pinia store：

```typescript
import { defineStore } from 'pinia'

export const useYourStore = defineStore('your', {
  state: () => ({}),
  actions: {},
})
```

---

## 环境变量

创建 `.env` 文件：

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

---

## License

MIT
