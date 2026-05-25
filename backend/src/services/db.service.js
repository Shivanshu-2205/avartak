import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path: backend/data/db.json
const DB_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.resolve(DB_DIR, 'db.json');

const defaultData = {
  users: [],
  profiles: []
};

// Helper to ensure database directory and file exist
const initDb = () => {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
      logger.info(`[Database] Initialized new JSON database file at ${DB_FILE}`);
    }
  } catch (err) {
    logger.error('[Database] Failed to initialize database file', err);
  }
};

// Read database
const readDb = () => {
  initDb();
  try {
    const content = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    logger.error('[Database] Error reading database file, returning default data', err);
    return defaultData;
  }
};

// Write database
const writeDb = (data) => {
  initDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    logger.error('[Database] Error writing to database file', err);
  }
};

export const DbService = {
  /**
   * Finds a user by email address.
   * @param {string} email 
   */
  getUserByEmail(email) {
    const db = readDb();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  /**
   * Finds a user by their unique ID.
   * @param {string} id 
   */
  getUserById(id) {
    const db = readDb();
    return db.users.find(u => u.id === id) || null;
  },

  /**
   * Creates a new user and corresponding profile.
   * @param {string} email 
   * @param {string} passwordHash 
   * @param {string} name 
   */
  createUser(email, passwordHash, name = '') {
    const db = readDb();
    
    // Check if user already exists
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('User already exists with this email address.');
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      passwordHash,
      createdAt: new Date()
    };

    const newProfile = {
      userId,
      name: name || email.split('@')[0],
      bio: 'New investigator in search of the truth.',
      avatar: 'detective-1', // Default avatar identifier
      themePreference: 'dark',
      updatedAt: new Date()
    };

    db.users.push(newUser);
    db.profiles.push(newProfile);
    
    writeDb(db);
    logger.success(`[Database] Created new user and profile for ${email}`);
    
    return { user: newUser, profile: newProfile };
  },

  /**
   * Retrieves profile by user ID.
   * @param {string} userId 
   */
  getProfileByUserId(userId) {
    const db = readDb();
    return db.profiles.find(p => p.userId === userId) || null;
  },

  /**
   * Updates user profile fields.
   * @param {string} userId 
   * @param {{name?: string, bio?: string, avatar?: string, themePreference?: string}} updates 
   */
  updateProfile(userId, updates) {
    const db = readDb();
    const profileIdx = db.profiles.findIndex(p => p.userId === userId);
    
    if (profileIdx === -1) {
      throw new Error('Profile not found.');
    }

    const currentProfile = db.profiles[profileIdx];
    const updatedProfile = {
      ...currentProfile,
      name: updates.name !== undefined ? updates.name : currentProfile.name,
      bio: updates.bio !== undefined ? updates.bio : currentProfile.bio,
      avatar: updates.avatar !== undefined ? updates.avatar : currentProfile.avatar,
      themePreference: updates.themePreference !== undefined ? updates.themePreference : currentProfile.themePreference,
      updatedAt: new Date()
    };

    db.profiles[profileIdx] = updatedProfile;
    writeDb(db);
    logger.success(`[Database] Updated profile for user ${userId}`);
    
    return updatedProfile;
  }
};
