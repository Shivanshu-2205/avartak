import { SYSTEM_PROMPT, getTopicPrompt, getFollowUpPrompt } from '../prompts/exploration.prompt.js';
import { logger } from '../utils/logger.js';

/**
 * Service to build prompts for the LLM.
 */
export const PromptService = {
  /**
   * Compiles the system and user prompt for initializing a topic.
   * @param {string} topic - Topic name.
   * @param {string} context - Topic context.
   * @returns {{system: string, prompt: string}}
   */
  buildTopicPrompt(topic, context) {
    logger.info(`Building topic exploration prompt for "${topic}"`);
    return {
      system: SYSTEM_PROMPT,
      prompt: getTopicPrompt(topic, context)
    };
  },

  /**
   * Compiles the system and user prompt for a follow-up question.
   * @param {string} topic - Active topic name.
   * @param {string} context - Active topic context.
   * @param {string} question - Follow-up question.
   * @returns {{system: string, prompt: string}}
   */
  buildFollowUpPrompt(topic, context, question) {
    logger.info(`Building follow-up prompt for topic "${topic}", question: "${question}"`);
    return {
      system: SYSTEM_PROMPT,
      prompt: getFollowUpPrompt(topic, context, question)
    };
  }
};
