import { TopicService } from '../services/topic.services.js';
import { ContextService } from '../services/context.service.js';
import { PromptService } from '../services/prompt.service.js';
import { LlmService } from '../services/llm.service.js';
import { StreamService } from '../services/stream.service.js';
import { logger } from '../utils/logger.js';

/**
 * Controller to handle searches/initiations of new topics.
 */
export const TopicController = {
  /**
   * Explores a new topic and streams LLM response.
   * Route: POST /api/topic
   */
  async exploreTopic(req, res) {
    const { topic } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'A valid "topic" string is required in the request body.' });
    }

    const trimmedTopic = topic.trim();
    logger.info(`Starting exploration workflow for topic: "${trimmedTopic}"`);

    try {
      // 1. Fetch data from external sources
      const rawData = await TopicService.fetchTopicData(trimmedTopic);

      // 2. Prepare, clean, and store context
      ContextService.setContext(rawData.title, rawData);
      const activeContext = ContextService.getContext();

      // 3. Build prompts
      const prompts = PromptService.buildTopicPrompt(activeContext.topic, activeContext.contextText);

      // 4. Generate stream from LLM
      const llmStream = await LlmService.generateStream(prompts);

      // 5. Pipe to client via Server-Sent Events (SSE)
      StreamService.handleSSEStream(res, llmStream, (accumulatedText, relatedTopics) => {
        logger.info(`Exploration complete for "${activeContext.topic}". LLM generated ${accumulatedText.length} chars.`);
      });

    } catch (error) {
      logger.error(`Failed to explore topic "${trimmedTopic}"`, error);

      // If headers are already sent, write error in SSE style and close
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: error.message || 'An error occurred during generation.' })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: error.message || 'Internal server error during topic exploration.' });
      }
    }
  }
};
