import axios from 'axios';

// ANSI terminal colors
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const cyan = (text) => `\x1b[36m${text}\x1b[0m`;

async function testEndpoints() {
  console.log(cyan('=== Running Express Endpoints E2E SSE Stream Test ===\n'));
  
  // 1. POST /api/topic
  console.log(cyan('--- Requesting POST /api/topic for "Quantum Computing" ---'));
  try {
    const response = await axios.post('http://localhost:5000/api/topic', {
      topic: 'Quantum Computing'
    }, {
      responseType: 'stream',
      timeout: 30000
    });
    
    await new Promise((resolve, reject) => {
      let buffer = '';
      response.data.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              console.log('\n--- SSE Stream Done ---');
              resolve();
              return;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.token) {
                process.stdout.write(parsed.token);
              }
              if (parsed.relatedTopics) {
                console.log('\n\nRelated Topics parsed in backend:', parsed.relatedTopics);
              }
              if (parsed.error) {
                console.error('\nError received in stream:', parsed.error);
                reject(new Error(parsed.error));
              }
            } catch (e) {
              // Ignore partial JSON
            }
          }
        }
      });
      response.data.on('error', reject);
      response.data.on('end', resolve);
    });
  } catch (err) {
    console.error('Failed to query /api/topic:', err.message);
    process.exit(1);
  }

  // 2. POST /api/ask
  console.log(cyan('\n--- Requesting POST /api/ask for follow-up "What is superposition?" ---'));
  try {
    const response = await axios.post('http://localhost:5000/api/ask', {
      question: 'What is superposition?'
    }, {
      responseType: 'stream',
      timeout: 30000
    });
    
    await new Promise((resolve, reject) => {
      let buffer = '';
      response.data.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              console.log('\n--- SSE Stream Done ---');
              resolve();
              return;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.token) {
                process.stdout.write(parsed.token);
              }
              if (parsed.relatedTopics) {
                console.log('\n\nRelated Topics parsed in backend:', parsed.relatedTopics);
              }
              if (parsed.error) {
                console.error('\nError received in stream:', parsed.error);
                reject(new Error(parsed.error));
              }
            } catch (e) {
              // Ignore partial JSON
            }
          }
        }
      });
      response.data.on('error', reject);
      response.data.on('end', resolve);
    });
  } catch (err) {
    console.error('Failed to query /api/ask:', err.message);
    process.exit(1);
  }

  console.log(green('\n=== Endpoints E2E SSE Stream Test Completed successfully! ==='));
}

testEndpoints();
