import { z } from 'zod';

export const createRequirementSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  type: z.enum(['text', 'document']).default('text'),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1),
  role: z.enum(['user']).default('user'),
});

export const apiKeyConfigSchema = z.object({
  provider: z.enum(['openai', 'claude', 'custom']),
  apiKey: z.string().min(1),
  baseURL: z.string().optional(),
  model: z.string().min(1),
});

export type CreateRequirementInput = z.infer<typeof createRequirementSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type APIKeyConfigInput = z.infer<typeof apiKeyConfigSchema>;
