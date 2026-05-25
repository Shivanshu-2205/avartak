import express from 'express';
import { AuthController } from '../controllers/auth.controller.js';

const router = express.Router();

// Signup endpoint (POST /api/auth/signup)
router.post('/signup', AuthController.signup);

// Login endpoint (POST /api/auth/login)
router.post('/login', AuthController.login);

export default router;
