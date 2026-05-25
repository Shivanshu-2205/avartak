import { DbService } from '../services/db.service.js';
import { logger } from '../utils/logger.js';

export const UserController = {
  /**
   * Retrieves the authenticated user's profile.
   * Route: GET /api/user/profile
   */
  async getProfile(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized: User context is missing.' });
      }

      let profile = DbService.getProfileByUserId(req.user.id);
      
      // If dev bypass is active and we don't have a profile in DB yet, create/return a default one
      if (!profile) {
        if (req.user.isBypassed) {
          profile = {
            userId: req.user.id,
            name: req.user.name || 'Developer Mode User',
            bio: 'Default sandbox developer profile.',
            avatar: 'detective-1',
            themePreference: 'dark',
            updatedAt: new Date()
          };
        } else {
          return res.status(404).json({ error: 'User profile not found.' });
        }
      }

      res.json(profile);
    } catch (error) {
      logger.error('[User] Failed to retrieve user profile', error);
      res.status(500).json({ error: 'An error occurred while fetching the profile.' });
    }
  },

  /**
   * Updates the authenticated user's profile.
   * Route: PUT /api/user/profile
   */
  async updateProfile(req, res) {
    const { name, bio, avatar, themePreference } = req.body;

    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized: User context is missing.' });
      }

      // If dev bypass is active, we don't store in DB (since DB record might not exist), just return updated mock object
      if (req.user.isBypassed) {
        const mockProfile = {
          userId: req.user.id,
          name: name || req.user.name,
          bio: bio || 'Default sandbox developer profile.',
          avatar: avatar || 'detective-1',
          themePreference: themePreference || 'dark',
          updatedAt: new Date()
        };
        logger.info(`[User] Updated mock developer profile (bypass mode)`);
        return res.json(mockProfile);
      }

      const updated = DbService.updateProfile(req.user.id, {
        name,
        bio,
        avatar,
        themePreference
      });

      res.json(updated);
    } catch (error) {
      logger.error(`[User] Failed to update profile for user ${req.user?.id}`, error);
      res.status(500).json({ error: 'An error occurred while updating the profile.' });
    }
  }
};
