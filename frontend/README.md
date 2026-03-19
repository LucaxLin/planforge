# PlanForge Web

PlanForge 前端应用 - AI 智能需求分析工具

## 技术栈

- **框架**: Nuxt 3
- **UI**: Tailwind CSS
- **状态管理**: Pinia
- **Markdown 编辑器**: Milkdown
- **HTTP 客户端**: 内置 $fetch

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

复制环境变量示例文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件设置 API 基础地址：

```
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### 开发模式

启动开发服务器：

```bash
pnpm dev
```

应用将在 `http://localhost:3000` 可访问

### 构建生产版本

```bash
pnpm build
```

### 预览生产构建

```bash
pnpm preview
```

## 项目结构

```
frontend/
├── assets/              # 静态资源和 CSS
│   └── css/            # 样式文件
├── components/          # Vue 组件
├── composables/        # Vue 组合式函数
├── layouts/            # 页面布局
├── pages/              # 页面组件
├── plugins/            # Nuxt 插件
├── stores/             # Pinia 状态管理
├── types/              # TypeScript 类型定义
├── public/             # 公共静态文件
├── app.vue             # 应用入口
└── nuxt.config.ts      # Nuxt 配置
```

## 功能特性

- AI 智能需求分析
- 支持多种 AI 提供商（OpenAI、Claude、自定义端点）
- 用户可配置 API 密钥（本地存储）
- 支持 Markdown 格式需求输入
- 生成详细的实施方案
- 导出 Markdown 格式文档

## API 配置

在浏览器中访问设置页面配置您的 AI 提供商：
1. 选择 AI 提供商（OpenAI / Claude / 自定义）
2. 输入您的 API 密钥
3. 选择模型
4. 保存配置

## 许可证

MIT
