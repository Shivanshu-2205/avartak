import axios from 'axios';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Service to interact with the local Ollama LLM server.
 */
export const LlmService = {
  /**
   * Calls Ollama API and returns the stream response.
   * @param {{system: string, prompt: string}} promptObj - Prepared system and user prompts.
   * @returns {Promise<import('stream').Readable>} - Axios response stream.
   */
  async generateStream(promptObj) {
    const url = `${env.OLLAMA_URL}/api/generate`;
    logger.info(`Sending prompt to Ollama at ${url} using model "${env.OLLAMA_MODEL}"`);

    try {
      const response = await axios.post(url, {
        model: env.OLLAMA_MODEL,
        prompt: promptObj.prompt,
        system: promptObj.system,
        stream: true,
        options: {
          temperature: 0.7,
          num_predict: 350 // Limit max output tokens to prevent runaway generation
        }
      }, {
        responseType: 'stream',
        timeout: 60000 // 60s timeout for model load/warmup
      });

      logger.success('Successfully initiated stream response from Ollama');
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        logger.error(`Connection refused at ${env.OLLAMA_URL}. Is Ollama running?`, error);
        throw new Error(`Ollama LLM server is not running or unreachable at ${env.OLLAMA_URL}. Please make sure Ollama is installed and running.`);
      }

      logger.error('Error generating response from Ollama API', error);
      throw error;
    }
  }
};
