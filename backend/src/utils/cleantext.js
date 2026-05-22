/**
 * Cleans Wikipedia text content by removing wikitext formatting, citations,
 * HTML elements, and extra whitespace.
 * @param {string} text - Raw Wikipedia or API content.
 * @returns {string} - Cleaned, plain-text content.
 */
export function cleanWikipediaText(text) {
  if (!text || typeof text !== 'string') return '';

  let cleaned = text;

  // 1. Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');

  // 2. Remove references/citations (e.g., [1], [citation needed], [nb 1])
  cleaned = cleaned.replace(/\[\d+\]/g, '');
  cleaned = cleaned.replace(/\[citation\s+needed\]/gi, '');
  cleaned = cleaned.replace(/\[[a-z]+\s+\d+\]/gi, '');

  // 3. Clean up link markdown like [[Wikipedia|Wikipedia article]] -> Wikipedia article
  // or [[Quantum Computing]] -> Quantum Computing
  cleaned = cleaned.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2');
  cleaned = cleaned.replace(/\[\[([^\]]+)\]\]/g, '$1');

  // 4. Clean up other MediaWiki syntax (headers, external links)
  cleaned = cleaned.replace(/==+\s*([^=]+)\s*==+/g, '\n$1\n'); // format headers nicely
  cleaned = cleaned.replace(/\[http[^\s\]]+\s+([^\]]+)\]/g, '$1'); // external links

  // 5. Remove edit links/brackets
  cleaned = cleaned.replace(/\[edit\]/gi, '');

  // 6. Clean up whitespace and newlines
  cleaned = cleaned.replace(/[ \t]+/g, ' '); // collapse spaces/tabs
  cleaned = cleaned.replace(/\n\s*\n\s*\n+/g, '\n\n'); // collapse multiple empty lines
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Compresses/truncates a string to a maximum number of words.
 * @param {string} text - Cleaned text.
 * @param {number} maxWords - Maximum allowed words.
 * @returns {string} - Truncated text.
 */
export function compressContextText(text, maxWords = 2500) {
  if (!text) return '';
  const words = text.split(/\s+/);
  if (words.length <= maxWords) {
    return text;
  }
  return words.slice(0, maxWords).join(' ') + '\n\n[Content truncated due to length limits...]';
}
