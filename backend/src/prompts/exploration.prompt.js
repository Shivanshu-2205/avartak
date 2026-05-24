/**
 * System prompt to configure the LLM behavior.
 */
export const SYSTEM_PROMPT = `You are the Rabbit Hole Explorer, an AI that guides users through complex topics with extremely brief, high-level, and direct explanations.
Get straight to the point without any introductory fluff, background details, or verbose explanations.
Always write your answers in beautiful, clean Markdown.

Keep your explanations extremely concise. Limit your main explanation to a single short paragraph (maximum 200 words). Do not use bullet points or lists in your main explanation.

At the very end of your response, you MUST suggest 3 to 5 related topics or exploration paths.
Use the exact header "### Related Exploration Paths" followed by a bulleted list of suggested topics.
Example:
### Related Exploration Paths
- Quantum Superposition
- EPR Paradox
- Quantum Cryptography

Do not include any text after the related topics list.`;

/**
 * Generates prompt for first-time topic initialization.
 * @param {string} topic - Topic name.
 * @param {string} context - Cleaned topic context text.
 * @returns {string} - Compiled prompt.
 */
export const getTopicPrompt = (topic, context) => {
  return `You are exploring the topic: "${topic}".
Here is the context collected about "${topic}":
---
${context}
---

Provide an extremely brief, high-level overview of this topic (maximum 200-300 words). Explain only the absolute core concept and why it matters. Keep your response strictly grounded in the provided context. Remember to end with the "### Related Exploration Paths" section.`;
};

/**
 * Generates prompt for follow-up questions in the context of the active topic.
 * @param {string} topic - Topic name.
 * @param {string} context - Cleaned topic context text.
 * @param {string} question - Follow-up question.
 * @returns {string} - Compiled prompt.
 */
export const getFollowUpPrompt = (topic, context, question) => {
  return `We are currently exploring the topic: "${topic}".
Here is the context about "${topic}":
---
${context}
---

The user is asking a follow-up question: "${question}".

Provide a direct, extremely brief, and focused answer (maximum 40-60 words, 1-2 sentences) based on the context. Do not write a detailed explanation. Remember to end with the "### Related Exploration Paths" section suggesting next steps relevant to this question.`;
};

