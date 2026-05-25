import express from 'express';
import { UserController } from '../controllers/user.controller.js';

const router = express.Router();

// GET user profile (GET /api/user/profile)
router.get('/profile', UserController.getProfile);

// UPDATE user profile (PUT /api/user/profile)
router.put('/profile', UserController.updateProfile);

export default router;
