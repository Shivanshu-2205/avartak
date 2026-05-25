import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { DbService } from '../services/db.service.js';

/**
 * Authentication middleware that enforces JWT token checks.
 * Under development environments (where env.BYPASS_AUTH is active),
 * it skips the check and populates req.user with mock developer credentials.
 */
export const requireAuth = (req, res, next) => {
  // Determine if we should bypass auth verification (active in local dev environment)
  const isBypassActive = env.BYPASS_AUTH === 'true' || process.env.NODE_ENV === 'development';

  if (isBypassActive) {
    logger.info(`[Auth Bypass] Auto-authenticating request for developer mode: ${req.method} ${req.originalUrl}`);
    
    // Set mock user context for development
    req.user = {
      id: 'dev-user-999',
      name: 'Developer Sandbox',
      email: 'dev@rabbithole.ai',
      role: 'admin',
      isBypassed: true
    };
    
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn(`[Auth] Blocked unauthorized request to ${req.method} ${req.originalUrl} - Missing token`);
    return res.status(401).json({ error: 'Unauthorized: Access token is missing or malformed.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify standard JWT token
    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // Look up real user in database
    const user = DbService.getUserById(decoded.id);
    if (!user) {
      logger.warn(`[Auth] Blocked request - Decoded user ID ${decoded.id} not found in database`);
      return res.status(401).json({ error: 'Unauthorized: User account no longer exists.' });
    }

    // Attach user record (excluding password hash) to request
    req.user = {
      id: user.id,
      email: user.email,
      role: decoded.role || 'user'
    };

    return next();
  } catch (error) {
    logger.error(`[Auth] Blocked request due to token verification failure: ${error.message}`);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired access token.' });
  }
};
