export interface AIConfig {
  provider: 'minimax' | 'zai' | 'custom';
  apiKey: string;
  baseURL?: string;
  model: string;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface Requirement {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'document';
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  analysis?: RequirementAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequirementAnalysis {
  entities: string[];
  constraints: string[];
  techStack: TechSuggestion[];
  confidence: number;
}

export interface TechSuggestion {
  category: string;
  technology: string;
  reason: string;
}

export interface Session {
  id: string;
  requirementId: string;
  messages: Message[];
  status: 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  content: string;
  type: 'clarification' | 'constraint' | 'preference';
  priority: number;
}

export interface Solution {
  id: string;
  requirementId: string;
  content: string;
  sections: SolutionSection[];
  generatedAt: Date;
}

export interface SolutionSection {
  title: string;
  content: string;
  subsections?: SolutionSection[];
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
