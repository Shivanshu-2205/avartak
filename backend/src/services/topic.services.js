import wikipedia from 'wikipedia';
const wiki = wikipedia.default || wikipedia;
import axios from 'axios';
import { logger } from '../utils/logger.js';

/**
 * Service to fetch topic-related information from Wikipedia and DuckDuckGo.
 */
export const TopicService = {
  /**
   * Fetches topic details from Wikipedia and DuckDuckGo API.
   * @param {string} topicName - The name of the topic to search.
   * @returns {Promise<{title: string, summary: string, content: string, sources: string[]}>}
   */
  async fetchTopicData(topicName) {
    logger.info(`Fetching data for topic: "${topicName}"`);

    let title = topicName;
    let wikipediaContent = '';
    let wikipediaSummary = '';
    const sources = [];

    // 1. Fetch from Wikipedia
    try {
      // Search for the topic first to find the best matching article title
      const searchResponse = await wiki.search(topicName);
      let pageTitle = topicName;

      if (searchResponse && searchResponse.results && searchResponse.results.length > 0) {
        pageTitle = searchResponse.results[0].title;
        logger.info(`Wikipedia search matched "${topicName}" to article: "${pageTitle}"`);
      } else {
        logger.warn(`No Wikipedia search results found for "${topicName}". Trying direct fetch.`);
      }

      // Fetch the page content
      try {
        const page = await wiki.page(pageTitle);
        title = page.title;
        wikipediaContent = await page.content();
        sources.push(`Wikipedia page: ${page.fullurl}`);
        
        // Fetch summary
        try {
          const summaryObj = await wiki.summary(pageTitle);
          wikipediaSummary = summaryObj.extract || '';
        } catch (sumErr) {
          logger.warn(`Could not fetch Wikipedia summary for "${pageTitle}"`, sumErr.message);
        }
      } catch (pageErr) {
        logger.warn(`Could not fetch Wikipedia page for "${pageTitle}"`, pageErr.message);
      }
    } catch (wikiErr) {
      logger.error(`Wikipedia API error for "${topicName}"`, wikiErr);
    }

    // 2. Fetch from DuckDuckGo Instant Answer API for enrichment
    let ddgSummary = '';
    try {
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(topicName)}&format=json&no_html=1`;
      logger.info(`Fetching DuckDuckGo data from: ${ddgUrl}`);
      const ddgResponse = await axios.get(ddgUrl, {
        headers: {
          'User-Agent': 'RabbitHoleBackend/1.0 (contact: admin@rabbithole.ai)'
        },
        timeout: 5000
      });

      if (ddgResponse.data) {
        const data = ddgResponse.data;
        if (data.AbstractText) {
          ddgSummary = data.AbstractText;
          sources.push(`DuckDuckGo Instant Answer: ${data.AbstractURL || 'https://duckduckgo.com'}`);
        }
      }
    } catch (ddgErr) {
      logger.warn(`DuckDuckGo API fetch failed for "${topicName}": ${ddgErr.message}`);
    }

    // 3. Combine results
    const combinedContent = [
      wikipediaContent ? `Wikipedia Page Content:\n${wikipediaContent}` : '',
      ddgSummary ? `DuckDuckGo Abstract:\n${ddgSummary}` : ''
    ].filter(Boolean).join('\n\n');

    const combinedSummary = wikipediaSummary || ddgSummary || `Information regarding ${topicName}`;

    if (!wikipediaContent && !ddgSummary) {
      logger.warn(`No data retrieved from external sources for "${topicName}"`);
      // Return a basic placeholder so we don't crash
      return {
        title: topicName,
        summary: `No external information found for "${topicName}".`,
        content: `No content could be retrieved from Wikipedia or DuckDuckGo for the topic "${topicName}".`,
        sources: []
      };
    }

    logger.success(`Successfully compiled external data for "${title}" (${sources.length} sources)`);

    return {
      title,
      summary: combinedSummary,
      content: combinedContent,
      sources
    };
  }
};
