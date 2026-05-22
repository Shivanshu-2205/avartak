import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import topicRouter from './routes/topic.routes.js';
import askRouter from './routes/ask.routes.js';
import { ContextService } from './services/context.service.js';

const app = express();

// 1. Middleware
app.use(cors({
  origin: '*', // Allow all origins for the development API
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} request to ${req.originalUrl}`);
  next();
});

// 2. Register Routes
app.use('/api/topic', topicRouter);
app.use('/api/ask', askRouter);

// Health check and status endpoint
app.get('/api/status', (req, res) => {
  const activeContext = ContextService.getContext();
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    config: {
      port: env.PORT,
      ollamaUrl: env.OLLAMA_URL,
      ollamaModel: env.OLLAMA_MODEL
    },
    activeContext: activeContext ? {
      topic: activeContext.topic,
      createdAt: activeContext.createdAt,
      sourceCount: activeContext.sources.length
    } : null
  });
});

// Clear context endpoint (useful utility)
app.post('/api/context/clear', (req, res) => {
  ContextService.clearContext();
  res.json({ message: 'Active context successfully cleared.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error('Unhandled server error', err);
  res.status(500).json({ error: 'An unexpected error occurred on the server.' });
});

// 3. Start Server
app.listen(env.PORT, () => {
  logger.success(`Rabbit Hole backend listening on port ${env.PORT}`);
  logger.info(`Ollama configured at: ${env.OLLAMA_URL}`);
  logger.info(`Ollama model: ${env.OLLAMA_MODEL}`);
});
