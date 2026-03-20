import { v4 as uuidv4 } from 'uuid';
import type { Requirement, Session, Solution, AIConfig, Message } from '../types/index.js';
import { aiService } from './ai.service.js';
import { analyzerSystemPrompt, analyzerUserPrompt } from '../prompts/analyzer.prompt.js';
import { generatorSystemPrompt, generateDocumentPrompt } from '../prompts/generator.prompt.js';
import logger from '../utils/logger.js';

interface SessionContext {
  framework?: string;
  features?: string;
  style?: string;
  tech?: string;
  otherContext?: string;
}

class RequirementService {
  private requirements: Map<string, Requirement> = new Map();
  private sessions: Map<string, Session> = new Map();
  private conversationHistory: Map<string, Message[]> = new Map();
  private sessionContext: Map<string, SessionContext> = new Map();

  async chat(requirementId: string, userMessage: string, aiConfig: AIConfig): Promise<string> {
    logger.info('Starting chat', { requirementId, userMessageLength: userMessage.length });

    aiService.configure(aiConfig);

    const history = this.conversationHistory.get(requirementId) || [];
    const requirement = this.requirements.get(requirementId);
    const context = this.sessionContext.get(requirementId) || {};

    const userMessageContent = userMessage.toLowerCase();
    if (userMessageContent.includes('生成文档') || userMessageContent.includes('生成方案')) {
      const solution = await this.generateSolution(requirementId, aiConfig);
      return `好的，正在为您生成完整的项目设计文档...\n\n文档已生成，共包含 ${solution.sections?.length || 0} 个章节。文档将自动下载。`;
    }

    this.extractContextFromMessage(userMessage, context);
    this.sessionContext.set(requirementId, context);

    history.push({ role: 'user', content: userMessage });

    const messages: Message[] = [
      { role: 'system', content: analyzerSystemPrompt }
    ];

    if (requirement) {
      messages.push({ role: 'user', content: analyzerUserPrompt(requirement.content) });
    }

    messages.push(...history);

    logger.info('Sending chat request', {
      requirementId,
      messageCount: messages.length,
      historyLength: history.length,
      context
    });

    const response = await aiService.chat(messages);

    history.push({ role: 'assistant', content: response });
    this.conversationHistory.set(requirementId, history);

    return response;
  }

  private extractContextFromMessage(message: string, context: SessionContext): void {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('vue') || lowerMessage.includes('react') ||
        lowerMessage.includes('next') || lowerMessage.includes('nuxt') ||
        lowerMessage.includes('uniapp') || lowerMessage.includes('flutter') ||
        lowerMessage.includes('electron') || lowerMessage.includes('tauri')) {
      if (lowerMessage.includes('vue') && lowerMessage.includes('element')) {
        context.framework = 'Vue 3 + Element Plus';
      } else if (lowerMessage.includes('react') && lowerMessage.includes('ant')) {
        context.framework = 'React + Ant Design';
      } else if (lowerMessage.includes('next')) {
        context.framework = 'Next.js';
      } else if (lowerMessage.includes('nuxt')) {
        context.framework = 'Nuxt 3';
      } else if (lowerMessage.includes('uniapp')) {
        context.framework = 'UniApp';
      } else if (lowerMessage.includes('flutter')) {
        context.framework = 'Flutter';
      } else if (lowerMessage.includes('electron')) {
        context.framework = 'Electron';
      } else if (lowerMessage.includes('tauri')) {
        context.framework = 'Tauri';
      }
    }

    const featureKeywords = ['用户管理', '登录', '注册', '权限', '数据管理', '列表', 'CRUD',
      '文件上传', '消息', '通知', '报表', '统计', '支付', '第三方'];
    const foundFeatures = featureKeywords.filter(keyword => lowerMessage.includes(keyword.toLowerCase()));
    if (foundFeatures.length > 0) {
      context.features = foundFeatures.join('、');
    }

    const styleKeywords = ['简洁', '专业', '扁平', '科技', '深色', '渐变', '商务', '稳重', '活泼', '年轻'];
    const foundStyle = styleKeywords.filter(keyword => lowerMessage.includes(keyword.toLowerCase()));
    if (foundStyle.length > 0) {
      context.style = foundStyle.join('、');
    }

    if (lowerMessage.includes('100用户') || lowerMessage.includes('1000') || lowerMessage.includes('10000') ||
        lowerMessage.includes('高并发') || lowerMessage.includes('大型')) {
      context.tech = context.tech || '';
      context.tech += '数据规模：' + (lowerMessage.includes('大型') || lowerMessage.includes('10000') ? '大型' :
        lowerMessage.includes('1000') ? '中型' : '小型');
    }
  }

  async generateSolution(
    requirementId: string,
    aiConfig: AIConfig
  ): Promise<Solution> {
    logger.info('Generating implementation solution', { requirementId });

    aiService.configure(aiConfig);

    const requirement = this.requirements.get(requirementId);
    if (!requirement) {
      throw new Error('Requirement not found');
    }

    const history = this.conversationHistory.get(requirementId) || [];
    const context = this.sessionContext.get(requirementId) || {};

    const conversationSummary = history.map(m => {
      const role = m.role === 'user' ? '【用户回答】' : '【AI提问】';
      return `${role}\n${m.content}`;
    }).join('\n\n---\n\n');

    const fullPrompt = `**原始需求：**
${requirement.content}

**对话历史摘要：**
${conversationSummary}

**已确定的上下文信息：**
- 框架选择：${context.framework || '根据需求推断'}
- 功能模块：${context.features || '根据需求推断'}
- 视觉风格：${context.style || '简洁专业（推荐）'}
- 技术细节：${context.tech || '标准配置'}`;

    const messages: Message[] = [
      { role: 'system', content: generatorSystemPrompt },
      { role: 'user', content: generateDocumentPrompt(fullPrompt) }
    ];

    const content = await aiService.chat(messages);

    const solution: Solution = {
      id: uuidv4(),
      requirementId,
      content,
      sections: this.parseMarkdownToSections(content),
      generatedAt: new Date(),
    };

    logger.info('Solution generated', { solutionId: solution.id, requirementId });
    return solution;
  }

  private parseMarkdownToSections(content: string) {
    const sections: { title: string; content: string; subsections?: any[] }[] = [];
    const lines = content.split('\n');
    let currentSection: any = null;

    for (const line of lines) {
      if (line.startsWith('## ')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: line.replace('## ', ''),
          content: '',
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  createRequirement(title: string, content: string, type: 'text' | 'document' = 'text'): Requirement {
    const requirement: Requirement = {
      id: uuidv4(),
      title,
      content,
      type,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.requirements.set(requirement.id, requirement);
    this.conversationHistory.set(requirement.id, []);
    this.sessionContext.set(requirement.id, {});
    logger.info('Requirement created', { id: requirement.id, title });
    return requirement;
  }

  getRequirement(id: string): Requirement | undefined {
    return this.requirements.get(id);
  }

  updateRequirement(id: string, updates: Partial<Requirement>): Requirement | undefined {
    const requirement = this.requirements.get(id);
    if (!requirement) return undefined;

    const updated = {
      ...requirement,
      ...updates,
      updatedAt: new Date(),
    };
    this.requirements.set(id, updated);
    return updated;
  }

  getConversationHistory(requirementId: string): Message[] {
    return this.conversationHistory.get(requirementId) || [];
  }

  updateConversationHistory(requirementId: string, history: Message[]): Message[] {
    this.conversationHistory.set(requirementId, history);
    return history;
  }

  getSessionContext(requirementId: string): SessionContext {
    return this.sessionContext.get(requirementId) || {};
  }

  clearConversationHistory(requirementId: string): void {
    this.conversationHistory.delete(requirementId);
    this.sessionContext.delete(requirementId);
    logger.info('Conversation history and context cleared', { requirementId });
  }
}

export const requirementService = new RequirementService();
export default requirementService;
