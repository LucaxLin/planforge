import OpenAI from 'openai';
import type { AIConfig, Message } from '../types/index.js';
import logger from '../utils/logger.js';

export class AIService {
  private client: OpenAI | null = null;
  private config: AIConfig | null = null;

  configure(config: AIConfig): void {
    this.config = config;
    
    let baseURL = config.baseURL;
    
    if (config.provider === 'minimax' && !baseURL) {
      baseURL = 'https://api.minimaxi.com/v1';
      logger.info('Using default MiniMax API endpoint', { baseURL });
    } else if (config.provider === 'zai' && !baseURL) {
      baseURL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
      logger.info('Using default Z.AI API endpoint', { baseURL });
    }
    
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: baseURL,
    });
    logger.info('AI service configured', { 
      provider: config.provider, 
      model: config.model,
      baseURL: baseURL || 'default'
    });
  }

  async chat(messages: Message[], systemPrompt?: string): Promise<string> {
    if (!this.client || !this.config) {
      throw new Error('AI service not configured');
    }

    const allMessages: Message[] = [];
    if (systemPrompt) {
      allMessages.push({ role: 'system', content: systemPrompt });
    }
    allMessages.push(...messages);

    try {
      logger.info('Calling AI API', { 
        provider: this.config.provider, 
        model: this.config.model,
        messageCount: messages.length 
      });

      const completion = await this.client.chat.completions.create({
        model: this.config.model,
        messages: allMessages as OpenAI.Chat.ChatCompletionMessageParam[],
        temperature: 0.7,
        max_tokens: 32000,
      });

      const response = completion.choices[0]?.message?.content || '';
      logger.info('AI API response received', { 
        provider: this.config.provider,
        responseLength: response.length 
      });

      return response;
    } catch (error) {
      logger.error('AI API call failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.config.provider 
      });
      throw error;
    }
  }

  async *chatStream(
    messages: Message[],
    systemPrompt?: string
  ): AsyncGenerator<string, void, unknown> {
    if (!this.client || !this.config) {
      throw new Error('AI service not configured');
    }

    const allMessages: Message[] = [];
    if (systemPrompt) {
      allMessages.push({ role: 'system', content: systemPrompt });
    }
    allMessages.push(...messages);

    try {
      logger.info('Starting streaming AI API call', { 
        provider: this.config.provider, 
        model: this.config.model 
      });

      const stream = await this.client.chat.completions.create({
        model: this.config.model,
        messages: allMessages as OpenAI.Chat.ChatCompletionMessageParam[],
        temperature: 0.7,
        max_tokens: 32000,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          yield content;
        }
      }

      logger.info('Streaming AI API call completed', { 
        provider: this.config.provider 
      });
    } catch (error) {
      logger.error('Streaming AI API call failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.config.provider 
      });
      throw error;
    }
  }

  getConfig(): AIConfig | null {
    return this.config;
  }
}

export const aiService = new AIService();
export default aiService;
