import { v4 as uuidv4 } from 'uuid';
import type { Requirement, RequirementAnalysis, Session, Question, Solution, AIConfig, Message } from '../types/index.js';
import { aiService } from './ai.service.js';
import { analyzerSystemPrompt, analyzerUserPrompt } from '../prompts/analyzer.prompt.js';
import { questionSystemPrompt, questionUserPrompt } from '../prompts/question.prompt.js';
import { generatorSystemPrompt, generatorUserPrompt } from '../prompts/generator.prompt.js';
import logger from '../utils/logger.js';

class RequirementService {
  private requirements: Map<string, Requirement> = new Map();
  private sessions: Map<string, Session> = new Map();
  private conversationHistory: Map<string, Message[]> = new Map();

  async chat(requirementId: string, userMessage: string, aiConfig: AIConfig): Promise<string> {
    logger.info('Starting chat', { requirementId, userMessageLength: userMessage.length });

    aiService.configure(aiConfig);

    let history = this.conversationHistory.get(requirementId) || [];
    const requirement = this.requirements.get(requirementId);

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
      historyLength: history.length 
    });

    const response = await aiService.chat(messages);

    logger.info('Chat response received', { 
      requirementId, 
      responseLength: response.length 
    });

    history.push({ role: 'assistant', content: response });
    this.conversationHistory.set(requirementId, history);

    return response;
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
    const conversationSummary = history.map(m => `${m.role === 'user' ? '用户' : 'AI'}: ${m.content}`).join('\n\n');

    const messages = [
      { role: 'system', content: generatorSystemPrompt },
      { role: 'user', content: generatorUserPrompt(requirement.content, undefined, conversationSummary) }
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

  clearConversationHistory(requirementId: string): void {
    this.conversationHistory.delete(requirementId);
    logger.info('Conversation history cleared', { requirementId });
  }
}

export const requirementService = new RequirementService();
export default requirementService;
