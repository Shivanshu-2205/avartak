import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DbService } from '../services/db.service.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const AuthController = {
  /**
   * Handles user signup.
   * Route: POST /api/auth/signup
   */
  async signup(req, res) {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    try {
      // Check if user already exists
      const existing = DbService.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'A user with this email address already exists.' });
      }

      // Hash password
      const salt = await bcryptjs.genSalt(10);
      const passwordHash = await bcryptjs.hash(password, salt);

      // Create user and profile
      const { user, profile } = DbService.createUser(email, passwordHash, name);

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: 'user' },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Account successfully created.',
        token,
        email: user.email,
        profile
      });
    } catch (error) {
      logger.error(`[Auth] Signup failed for ${email}`, error);
      res.status(500).json({ error: 'An error occurred during registration.' });
    }
  },

  /**
   * Handles user login.
   * Route: POST /api/auth/login
   */
  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
      // Find user
      const user = DbService.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Compare password
      const isMatch = await bcryptjs.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Get profile
      const profile = DbService.getProfileByUserId(user.id);

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: 'user' },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      logger.info(`[Auth] User logged in: ${email}`);

      res.json({
        message: 'Successfully logged in.',
        token,
        email: user.email,
        profile
      });
    } catch (error) {
      logger.error(`[Auth] Login failed for ${email}`, error);
      res.status(500).json({ error: 'An error occurred during authentication.' });
    }
  }
};
