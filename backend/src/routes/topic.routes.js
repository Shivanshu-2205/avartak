import express from 'express';
import { TopicController } from '../controllers/topic.controller.js';

const router = express.Router();

// Explore a new topic (POST /api/topic)
router.post('/', TopicController.exploreTopic);

export default router;
