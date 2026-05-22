import { cleanWikipediaText, compressContextText } from '../utils/cleantext.js';
import { logger } from '../utils/logger.js';

// In-memory singleton container for the active context
let activeContext = {
  topic: null,
  summary: null,
  contextText: null,
  sources: [],
  createdAt: null
};

/**
 * Service to manage temporary topic-specific context in memory.
 */
export const ContextService = {
  /**
   * Cleans, compresses, and sets the active topic context.
   * @param {string} topicName - Name of the topic.
   * @param {{content: string, summary: string, sources: string[]}} topicData - Fetched raw data.
   */
  setContext(topicName, topicData) {
    logger.info(`Setting active context for: "${topicName}"`);

    const cleanedContent = cleanWikipediaText(topicData.content);
    const compressedContent = compressContextText(cleanedContent, 800); // compress to max 800 words (~1.2k tokens)

    activeContext = {
      topic: topicName,
      summary: topicData.summary,
      contextText: compressedContent,
      sources: topicData.sources || [],
      createdAt: new Date()
    };

    logger.success(`Context successfully set and compressed for "${topicName}". Length: ${compressedContent.length} chars.`);
  },

  /**
   * Retrieves the currently active context.
   * @returns {{topic: string, summary: string, contextText: string, sources: string[], createdAt: Date} | null}
   */
  getContext() {
    if (!activeContext.topic) {
      return null;
    }
    return activeContext;
  },

  /**
   * Clears the currently active context from memory.
   */
  clearContext() {
    logger.info(`Clearing active context for: "${activeContext.topic || 'none'}"`);
    activeContext = {
      topic: null,
      summary: null,
      contextText: null,
      sources: [],
      createdAt: null
    };
  }
};
