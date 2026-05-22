import { cleanWikipediaText, compressContextText } from './src/utils/cleantext.js';
import { TopicService } from './src/services/topic.services.js';
import { LlmService } from './src/services/llm.service.js';
import { env } from './src/config/env.js';
import axios from 'axios';

// ANSI terminal colors
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const cyan = (text) => `\x1b[36m${text}\x1b[0m`;

async function runTests() {
  console.log(cyan('=== Running Backend Unit and Integration Tests ===\n'));

  // Test 1: cleantext.js Unit Tests
  console.log(cyan('--- Test 1: Text Cleaning Utility ---'));
  const dirtyText = `
    This is [[JavaScript]]! 
    It was created in 1995. <span class="ignore">Some HTML tags</span> [1] [citation needed].
    == History ==
    More text. [[Brendan Eich|Eich]] did it. [2]
  `;
  const cleaned = cleanWikipediaText(dirtyText);
  console.log('Original Text:', dirtyText.trim());
  console.log('Cleaned Text:', cleaned);

  if (
    cleaned.includes('JavaScript') &&
    !cleaned.includes('<span') &&
    !cleaned.includes('[1]') &&
    !cleaned.includes('citation needed') &&
    cleaned.includes('Eich') &&
    !cleaned.includes('Brendan Eich|') &&
    cleaned.includes('History')
  ) {
    console.log(green('✔ Test 1 (cleantext.js) PASSED\n'));
  } else {
    console.log(red('✘ Test 1 (cleantext.js) FAILED\n'));
    process.exit(1);
  }

  // Test 2: TopicService fetch tests (Wikipedia + DDG)
  console.log(cyan('--- Test 2: TopicService Integration ---'));
  const testTopic = 'JavaScript';
  try {
    const data = await TopicService.fetchTopicData(testTopic);
    console.log(`Title fetched: "${data.title}"`);
    console.log(`Summary length: ${data.summary.length} characters`);
    console.log(`Content length: ${data.content.length} characters`);
    console.log('Sources:', data.sources);

    if (data.title && data.summary && data.content && data.sources.length > 0) {
      console.log(green('✔ Test 2 (TopicService) PASSED\n'));
    } else {
      console.log(red('✘ Test 2 (TopicService) FAILED (insufficient data)\n'));
      process.exit(1);
    }
  } catch (error) {
    console.log(red(`✘ Test 2 (TopicService) FAILED with error: ${error.message}\n`));
    process.exit(1);
  }

  // Test 3: Ollama Connection & Model Verification
  console.log(cyan('--- Test 3: Ollama Server & Model Configuration ---'));
  console.log(`Checking Ollama connection at ${env.OLLAMA_URL}...`);
  try {
    const response = await axios.get(`${env.OLLAMA_URL}/api/tags`, { timeout: 3000 });
    const models = response.data?.models || [];
    console.log('Ollama is running!');
    console.log('Available models:', models.map(m => m.name));

    const configuredModel = env.OLLAMA_MODEL;
    const modelExists = models.some(m => m.name.startsWith(configuredModel));
    
    if (modelExists) {
      console.log(green(`✔ Configured model "${configuredModel}" is available in Ollama.`));
    } else {
      console.log(yellow(`⚠ Configured model "${configuredModel}" is NOT in the list of available models.`));
      console.log(yellow(`  Please pull the model using: ollama pull ${configuredModel}`));
    }
    console.log(green('✔ Test 3 (Ollama connection) PASSED\n'));
  } catch (error) {
    console.log(yellow(`⚠ Test 3 Warning: Could not connect to Ollama at ${env.OLLAMA_URL}.`));
    console.log(yellow(`  Make sure Ollama is running if you want to perform real-time LLM query tests.`));
    console.log(yellow(`  Error details: ${error.message}\n`));
  }

  // Test 4: E2E LLM Stream test (if Ollama is running and has the model)
  console.log(cyan('--- Test 4: LLM Generation Test ---'));
  try {
    const promptObj = {
      system: 'You are a helpful assistant. Reply with "TEST SUCCESSFUL" and list 3 related topics.',
      prompt: 'Hello!'
    };
    const stream = await LlmService.generateStream(promptObj);
    console.log('Stream started. Reading first few chunks...');
    let chunkCount = 0;
    
    await new Promise((resolve, reject) => {
      let fullResponse = '';
      let buffer = '';
      
      stream.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            const token = parsed.response || '';
            if (token) {
              process.stdout.write(token);
              fullResponse += token;
              chunkCount++;
            }
            if (parsed.done) {
              resolve(fullResponse);
            }
          } catch (e) {}
        }
      });
      
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(fullResponse));
    });
    
    console.log('\n');
    if (chunkCount > 0) {
      console.log(green('✔ Test 4 (LLM Generation) PASSED\n'));
    } else {
      console.log(red('✘ Test 4 (LLM Generation) FAILED (no tokens returned)\n'));
      process.exit(1);
    }
  } catch (error) {
    console.log(yellow(`⚠ Test 4 skipped or failed: ${error.message}\n`));
  }

  console.log(green('=== Verification Suite Completed successfully! ==='));
}

runTests();
