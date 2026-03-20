export const questionSystemPrompt = `你是一位资深软件架构师，擅长通过渐进式问答帮助用户明确项目需求。

**核心原则：**
1. 每轮只问1个核心问题，或最多2个紧密相关的问题
2. 所有问题必须是选择题（用 ①②③ 格式）
3. 从宏观到微观，逐步深入
4. 始终使用中文回复

**渐进式问答顺序：**

1. **确定项目类型和框架**（第一轮）
2. **确定核心功能模块**（第二轮）
3. **确定视觉风格和UI**（第三轮）
4. **确定技术细节**（第四轮）
5. **其他补充**（第五轮）
6. **询问是否生成文档**（结束）

**每次回复格式：**
1. 简短确认你对用户回答的理解（1句话）
2. 提出下一个选择题
3. 等待用户回复`;

export const getFirstQuestionPrompt = (requirement: string) => `用户需求：${requirement}

请理解这个需求，然后从以下选项中选择最合适的框架方向提问：

**如果是网站/Web应用项目：**
① Vue 3 + Element Plus（适合后台管理系统、数据管理平台）
② React + Ant Design（适合企业级应用、数据看板）
③ Next.js（适合内容网站、电商、SaaS产品）
④ Nuxt 3（适合需要SEO的网站）

**如果是小程序/移动端：**
① UniApp（跨平台，一套代码多端运行）
② Flutter（高性能原生体验）
③ React Native（React生态）

**如果是桌面应用：**
① Electron（网页技术，生态丰富）
② Tauri（轻量、高性能，基于Rust）
③ Flutter Desktop（跨平台）

请选择用户项目最适合的框架类型进行提问。`;

export const getFollowUpQuestion = (context: {
  round: number;
  framework?: string;
  features?: string;
  style?: string;
  tech?: string;
}) => {
  const { round, framework, features, style, tech } = context;

  if (round === 2 && framework) {
    return `好的，用户选择了：${framework}

接下来询问核心功能。请提问：用户项目最重要的3-5个功能模块是什么？

给出选项参考：
- 用户管理（登录注册、权限控制）
- 数据管理（增删改查、列表展示）
- 文件上传与处理
- 消息通知
- 报表统计
- 支付功能
- 第三方集成

让用户选择或补充。`;
  }

  if (round === 3 && features) {
    return `好的，用户确认的功能模块：${features}

接下来询问视觉风格。请提问：希望项目呈现什么样的视觉效果？

选项：
① 简洁专业（大量留白、扁平化设计、追求极简）
② 现代科技感（深色主题、渐变色、动效丰富）
③ 商务稳重（传统布局、层次分明）
④ 活泼年轻（圆角、亮色、插画风格）`;
  }

  if (round === 4 && style) {
    return `好的，用户选择的风格：${style}

接下来询问技术细节。请提问：

1. 数据规模：预计有多少用户？
① 小型（<100用户）
② 中型（100-10000用户）
③ 大型（>10000用户，高并发）

2. 是否需要移动端适配？
① PC端即可
② 响应式适配（PC+平板+手机）
③ 需要原生APP`;
  }

  if (round === 5 && tech) {
    return `好的，技术细节：${tech}

最后询问是否有其他补充。请问：

1. 是否需要第三方服务集成（微信/支付宝、短信、地图等）？
① 需要
② 不需要

2. 是否需要国际化（多语言）？
① 需要
② 不需要`;
  }

  return `继续对话，直到信息足够完整。询问用户是否还有需要补充的方面，或者可以开始生成文档了。`;
};

export default {
  questionSystemPrompt,
  getFirstQuestionPrompt,
  getFollowUpQuestion,
};
