import type { Request, Response } from 'express';
import { requirementService } from '../services/requirement.service.js';
import logger from '../utils/logger.js';
import type { AIConfig } from '../types/index.js';

const extractAIConfig = (req: Request): AIConfig => {
  const provider = req.headers['x-api-provider'] as string;
  const apiKey = req.headers['x-api-key'] as string;
  const baseURL = req.headers['x-api-baseurl'] as string | undefined;
  const model = req.headers['x-api-model'] as string;

  if (!provider || !apiKey || !model) {
    throw new Error('Missing required AI configuration headers');
  }

  return {
    provider: provider as 'minimax' | 'zai' | 'custom',
    apiKey,
    baseURL,
    model,
  };
};

export const generateAnalysis = async (req: Request, res: Response) => {
  const { requirementId } = req.body;

  try {
    const aiConfig = extractAIConfig(req);
    const requirement = requirementService.getRequirement(requirementId);

    if (!requirement) {
      res.status(404).json({
        error: 'Not Found',
        message: `Requirement ${requirementId} not found`,
        statusCode: 404,
      });
      return;
    }

    const analysis = await requirementService.analyzeRequirement(requirement.content, aiConfig);

    requirementService.updateRequirement(requirementId, {
      status: 'completed',
      analysis,
    });

    res.json({
      requirementId,
      analysis,
    });
  } catch (error) {
    logger.error('Analysis generation failed', { error: error instanceof Error ? error.message : 'Unknown' });
    throw error;
  }
};

export const generateQuestions = async (req: Request, res: Response) => {
  const { requirementId } = req.body;

  try {
    const aiConfig = extractAIConfig(req);
    const requirement = requirementService.getRequirement(requirementId);

    if (!requirement) {
      res.status(404).json({
        error: 'Not Found',
        message: `Requirement ${requirementId} not found`,
        statusCode: 404,
      });
      return;
    }

    const questions = await requirementService.generateQuestions(
      requirement.content,
      requirement.analysis,
      aiConfig
    );

    res.json({
      requirementId,
      questions,
    });
  } catch (error) {
    logger.error('Questions generation failed', { error: error instanceof Error ? error.message : 'Unknown' });
    throw error;
  }
};

export const generateSolution = async (req: Request, res: Response) => {
  const { requirementId, answers } = req.body;

  try {
    const aiConfig = extractAIConfig(req);
    const requirement = requirementService.getRequirement(requirementId);

    if (!requirement) {
      res.status(404).json({
        error: 'Not Found',
        message: `Requirement ${requirementId} not found`,
        statusCode: 404,
      });
      return;
    }

    const solution = await requirementService.generateSolution(
      requirement.content,
      requirement.analysis,
      answers,
      aiConfig
    );

    solution.requirementId = requirementId;

    res.json({
      requirementId,
      solution,
    });
  } catch (error) {
    logger.error('Solution generation failed', { error: error instanceof Error ? error.message : 'Unknown' });
    throw error;
  }
};

export const exportMarkdown = async (req: Request, res: Response) => {
  const { requirementId, solution } = req.body;

  const requirement = requirementService.getRequirement(requirementId);

  if (!requirement) {
    res.status(404).json({
      error: 'Not Found',
      message: `Requirement ${requirementId} not found`,
      statusCode: 404,
    });
    return;
  }

  let markdown = `# ${requirement.title}\n\n`;
  markdown += `## Original Requirement\n\n${requirement.content}\n\n`;

  if (requirement.analysis) {
    markdown += `## Analysis\n\n`;
    markdown += `### Key Entities\n`;
    requirement.analysis.entities.forEach(entity => {
      markdown += `- ${entity}\n`;
    });
    markdown += `\n### Constraints\n`;
    requirement.analysis.constraints.forEach(constraint => {
      markdown += `- ${constraint}\n`;
    });
    markdown += `\n`;
  }

  if (solution) {
    markdown += `## Implementation Plan\n\n${solution}\n`;
  }

  res.setHeader('Content-Type', 'text/markdown');
  res.setHeader('Content-Disposition', `attachment; filename="${requirement.title.replace(/[^a-z0-9]/gi, '_')}_plan.md"`);
  res.send(markdown);
};
