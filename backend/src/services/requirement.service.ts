import { v4 as uuidv4 } from 'uuid';
import type { Requirement, RequirementAnalysis, Session, Question, Solution, AIConfig } from '../types/index.js';
import { aiService } from './ai.service.js';
import { analyzerSystemPrompt, analyzerUserPrompt } from '../prompts/analyzer.prompt.js';
import { questionSystemPrompt, questionUserPrompt } from '../prompts/question.prompt.js';
import { generatorSystemPrompt, generatorUserPrompt } from '../prompts/generator.prompt.js';
import logger from '../utils/logger.js';

class RequirementService {
  private requirements: Map<string, Requirement> = new Map();
  private sessions: Map<string, Session> = new Map();

  async analyzeRequirement(content: string, aiConfig: AIConfig): Promise<RequirementAnalysis> {
    logger.info('Starting requirement analysis', { contentLength: content.length });

    aiService.configure(aiConfig);

    const response = await aiService.chat(
      [{ role: 'user', content: analyzerUserPrompt(content) }],
      analyzerSystemPrompt
    );

    try {
      const analysis = JSON.parse(response) as RequirementAnalysis;
      logger.info('Requirement analysis completed', { 
        entityCount: analysis.entities.length,
        confidence: analysis.confidence 
      });
      return analysis;
    } catch (error) {
      logger.error('Failed to parse analysis response', { error });
      throw new Error('Failed to parse AI response');
    }
  }

  async generateQuestions(
    requirement: string,
    analysis?: RequirementAnalysis,
    aiConfig?: AIConfig
  ): Promise<Question[]> {
    logger.info('Generating clarifying questions');

    if (!aiConfig) {
      const config = aiService.getConfig();
      if (!config) {
        throw new Error('AI not configured');
      }
      aiConfig = config;
    } else {
      aiService.configure(aiConfig);
    }

    const analysisStr = analysis ? JSON.stringify(analysis, null, 2) : undefined;
    const response = await aiService.chat(
      [{ role: 'user', content: questionUserPrompt(requirement, analysisStr) }],
      questionSystemPrompt
    );

    try {
      const questions = JSON.parse(response) as Question[];
      logger.info('Questions generated', { count: questions.length });
      return questions;
    } catch (error) {
      logger.error('Failed to parse questions response', { error });
      throw new Error('Failed to parse AI response');
    }
  }

  async generateSolution(
    requirement: string,
    analysis?: RequirementAnalysis,
    answers?: string,
    aiConfig?: AIConfig
  ): Promise<Solution> {
    logger.info('Generating implementation solution');

    if (!aiConfig) {
      const config = aiService.getConfig();
      if (!config) {
        throw new Error('AI not configured');
      }
      aiConfig = config;
    } else {
      aiService.configure(aiConfig);
    }

    const analysisStr = analysis ? JSON.stringify(analysis, null, 2) : undefined;
    const content = await aiService.chat(
      [{ role: 'user', content: generatorUserPrompt(requirement, analysisStr, answers) }],
      generatorSystemPrompt
    );

    const solution: Solution = {
      id: uuidv4(),
      requirementId: '',
      content,
      sections: this.parseMarkdownToSections(content),
      generatedAt: new Date(),
    };

    logger.info('Solution generated', { solutionId: solution.id });
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

  createSession(requirementId: string): Session {
    const session: Session = {
      id: uuidv4(),
      requirementId,
      messages: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sessions.set(session.id, session);
    logger.info('Session created', { sessionId: session.id, requirementId });
    return session;
  }

  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  addMessageToSession(sessionId: string, message: { role: 'user' | 'assistant'; content: string }): Session | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    session.messages.push({
      role: message.role,
      content: message.content,
    });
    session.updatedAt = new Date();
    this.sessions.set(sessionId, session);
    return session;
  }
}

export const requirementService = new RequirementService();
export default requirementService;
