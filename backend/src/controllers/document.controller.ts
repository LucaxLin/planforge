import type { Request, Response } from 'express';
import { requirementService } from '../services/requirement.service.js';

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
    if (requirement.analysis.entities) {
      requirement.analysis.entities.forEach((entity: string) => {
        markdown += `- ${entity}\n`;
      });
    }
    markdown += `\n### Constraints\n`;
    if (requirement.analysis.constraints) {
      requirement.analysis.constraints.forEach((constraint: string) => {
        markdown += `- ${constraint}\n`;
      });
    }
    markdown += `\n`;
  }

  if (solution) {
    markdown += `## Implementation Plan\n\n${solution}\n`;
  }

  res.setHeader('Content-Type', 'text/markdown');
  res.setHeader('Content-Disposition', `attachment; filename="${requirement.title.replace(/[^a-z0-9]/gi, '_')}_plan.md"`);
  res.send(markdown);
};
