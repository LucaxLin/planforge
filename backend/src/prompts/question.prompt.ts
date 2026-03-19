export const questionSystemPrompt = `You are a helpful AI assistant specialized in requirement clarification. Your task is to ask relevant clarifying questions to help users define their requirements more precisely.

Generate questions that:
1. Clarify ambiguous requirements
2. Identify missing constraints
3. Understand user preferences
4. Define success criteria

Ask 3-5 focused questions that are most critical for creating a solid implementation plan.`;

export const questionUserPrompt = (
  requirement: string, 
  analysis?: string
) => {
  let prompt = `Based on the following requirement:\n\n${requirement}\n\n`;
  
  if (analysis) {
    prompt += `Previous analysis:\n${analysis}\n\n`;
  }
  
  prompt += `Generate clarifying questions to better understand this requirement. 
Format your response as a JSON array:
[
  {
    "id": "q1",
    "content": "question text",
    "type": "clarification|constraint|preference",
    "priority": 1-5
  }
]`;
  
  return prompt;
};

export default {
  questionSystemPrompt,
  questionUserPrompt,
};
