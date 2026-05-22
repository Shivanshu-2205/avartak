import { ContextService } from '../services/context.service.js';
import { PromptService } from '../services/prompt.service.js';
import { LlmService } from '../services/llm.service.js';
import { StreamService } from '../services/stream.service.js';
import { logger } from '../utils/logger.js';

/**
 * Controller to handle follow-up questions on the currently active topic.
 */
export const AskController = {
  /**
   * Answers a follow-up question using the currently stored topic context.
   * Route: POST /api/ask
   */
  async askFollowUp(req, res) {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'A valid "question" string is required in the request body.' });
    }

    const trimmedQuestion = question.trim();
    logger.info(`Received follow-up question: "${trimmedQuestion}"`);

    // 1. Retrieve the active context
    const activeContext = ContextService.getContext();
    if (!activeContext) {
      logger.warn('Attempted to ask a follow-up question but no topic context is active.');
      return res.status(400).json({
        error: 'No active topic context. You must search/explore a topic first before asking follow-up questions.'
      });
    }

    logger.info(`Context exists for active topic: "${activeContext.topic}"`);

    try {
      // 2. Build the follow-up prompt
      const prompts = PromptService.buildFollowUpPrompt(
        activeContext.topic,
        activeContext.contextText,
        trimmedQuestion
      );

      // 3. Generate stream from LLM
      const llmStream = await LlmService.generateStream(prompts);

      // 4. Pipe to client via Server-Sent Events (SSE)
      StreamService.handleSSEStream(res, llmStream, (accumulatedText) => {
        logger.info(`Follow-up response complete. Generated ${accumulatedText.length} chars.`);
      });

    } catch (error) {
      logger.error(`Failed to handle follow-up question for topic "${activeContext.topic}"`, error);

      // If headers are already sent, write error in SSE style and close
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: error.message || 'An error occurred during generation.' })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: error.message || 'Internal server error during follow-up.' });
      }
    }
  }
};
