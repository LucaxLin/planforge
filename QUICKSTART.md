# PlanForge 快速开始指南

## 🚀 快速启动

### 1. 安装依赖

```bash
# 在项目根目录
pnpm install

# 或者使用 npm
npm install
```

### 2. 配置环境变量

```bash
# 复制环境变量示例文件
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

编辑 `backend/.env`:

```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

编辑 `frontend/.env`:

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### 3. 启动开发服务器

```bash
# 启动后端 (http://localhost:3001)
pnpm dev:backend

# 启动前端 (http://localhost:3000) - 新开终端
pnpm dev:frontend
```

或者同时启动：

```bash
pnpm dev
```

## 📝 基本使用流程

### 1. 配置 AI

1. 打开浏览器访问 `http://localhost:3000`
2. 点击 "Settings" 导航到配置页面
3. 选择你的 AI 提供商（OpenAI / Claude / Custom）
4. 输入你的 API Key
5. 选择模型
6. 点击 "Save Configuration"

### 2. 输入需求

1. 在首页文本框中输入你的项目需求
2. 可选：输入项目标题
3. 点击 "Analyze Requirement"

### 3. 查看分析结果

系统会自动分析你的需求，提取：
- 关键实体
- 技术约束
- 建议的技术栈

### 4. 生成问题

点击 "Generate Questions" 获取澄清性问题，帮助完善需求。

### 5. 生成方案

点击 "Generate Solution" 生成完整的实施方案。

### 6. 导出

可以将生成的方案导出为 Markdown 格式。

## 🔧 项目结构

```
planforge/
├── frontend/                 # Nuxt 3 前端
│   ├── src/
│   │   ├── pages/          # 页面
│   │   ├── components/      # 组件
│   │   ├── stores/         # Pinia 状态
│   │   └── layouts/        # 布局
│   └── package.json
│
├── backend/                 # Express 后端
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── services/       # 业务逻辑
│   │   ├── routes/         # 路由
│   │   ├── prompts/        # AI 提示词
│   │   └── types/          # 类型定义
│   └── package.json
│
└── package.json             # pnpm workspace 配置
```

## 🛠️ API 接口

### 需求管理
- `POST /api/requirements` - 创建需求
- `GET /api/requirements/:id` - 获取需求详情
- `POST /api/requirements/:id/analyze` - 分析需求

### 对话管理
- `POST /api/sessions` - 创建会话
- `POST /api/sessions/:id/messages` - 发送消息

### 方案生成
- `POST /api/generate/questions` - 生成澄清问题
- `POST /api/generate/solution` - 生成实施方案
- `POST /api/export/markdown` - 导出 Markdown

## 🔐 安全说明

- API Key 存储在浏览器的 localStorage 中
- 每次请求时，API Key 通过 HTTP Header 发送到后端
- 后端不会存储你的 API Key
- 建议使用 HTTPS 进行生产环境部署

## 🐛 常见问题

### 后端启动失败

检查：
1. Node.js 版本是否 >= 18
2. 依赖是否安装成功
3. 端口 3001 是否被占用

### 前端无法连接后端

检查：
1. 后端是否正常运行
2. CORS 配置是否正确
3. 环境变量中的 API_BASE_URL 是否正确

### AI 调用失败

检查：
1. API Key 是否正确配置
2. API Key 是否有足够的配额
3. 网络连接是否正常

## 📚 下一步

- 查看完整文档：[.trae/documents/PlanForge项目实施计划.md](./.trae/documents/PlanForge%E9%A1%B9%E7%9B%AE%E5%AE%9E%E6%96%BD%E8%AE%A1%E5%88%92.md)
- 查看 API 文档：[backend/src/routes](./backend/src/routes)
- 自定义 AI 提示词：[backend/src/prompts](./backend/src/prompts)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT
