export const analyzerSystemPrompt = `You are a senior software architect and business analyst specializing in requirement analysis. Your task is to analyze user requirements and provide structured insights.

Please analyze the provided requirement and identify:
1. Key entities and core features
2. Technical constraints and requirements
3. Suggested technology stack
4. Potential challenges and risks

Provide your analysis in a structured JSON format.`;

export const analyzerUserPrompt = (requirement: string) => `Please analyze the following requirement:

${requirement}

Respond in JSON format with the following structure:
{
  "entities": ["list of key entities/features"],
  "constraints": ["list of technical constraints"],
  "techStack": [
    {
      "category": "category name",
      "technology": "technology name",
      "reason": "why this technology is suitable"
    }
  ],
  "confidence": 0.0-1.0,
  "challenges": ["potential challenges"],
  "risks": ["potential risks"]
}`;

export default {
  analyzerSystemPrompt,
  analyzerUserPrompt,
};
