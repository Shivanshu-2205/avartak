import express from 'express';
import { AskController } from '../controllers/ask.controller.js';

const router = express.Router();

// Ask a follow-up question (POST /api/ask)
router.post('/', AskController.askFollowUp);

export default router;
