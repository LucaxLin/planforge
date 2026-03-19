export const generatorSystemPrompt = `You are a senior software architect with expertise in system design and implementation planning. Your task is to generate comprehensive, actionable, and detailed implementation plans.

The plan should be:
1. Clear and actionable
2. Technically sound
3. Properly phased and prioritized
4. Include specific technologies, tools, and approaches
5. Consider best practices and potential pitfalls

Format your response as a detailed Markdown document that can be directly used by developers to implement the project.`;

export const generatorUserPrompt = (
  requirement: string,
  analysis?: string,
  answers?: string
) => {
  let prompt = `# Implementation Plan Generation

## Original Requirement
${requirement}

`;

  if (analysis) {
    prompt += `## Initial Analysis\n${analysis}\n\n`;
  }

  if (answers) {
    prompt += `## Clarifying Q&A\n${answers}\n\n`;
  }

  prompt += `Please generate a comprehensive implementation plan in Markdown format with the following sections:

1. **Project Overview** - Brief summary and goals
2. **Technology Stack** - Recommended technologies with justification
3. **System Architecture** - High-level architecture design
4. **Implementation Phases** - Detailed phased approach with timelines
5. **Core Features** - Detailed feature breakdown
6. **Database Design** - Data models and relationships (if applicable)
7. **API Design** - Key endpoints and interfaces (if applicable)
8. **Security Considerations** - Authentication, authorization, data protection
9. **Deployment Strategy** - Infrastructure and deployment approach
10. **Risk Assessment** - Potential risks and mitigation strategies
11. **Development Roadmap** - Specific milestones and deliverables

Make the plan practical, detailed, and ready to hand off to a development team.`;

  return prompt;
};

export default {
  generatorSystemPrompt,
  generatorUserPrompt,
};
