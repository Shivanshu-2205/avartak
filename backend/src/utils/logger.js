export const logger = {
  info: (msg, ...args) => {
    console.log(`\x1b[36m[INFO] [${new Date().toISOString()}]\x1b[0m ${msg}`, ...args);
  },
  success: (msg, ...args) => {
    console.log(`\x1b[32m[SUCCESS] [${new Date().toISOString()}]\x1b[0m ${msg}`, ...args);
  },
  warn: (msg, ...args) => {
    console.warn(`\x1b[33m[WARN] [${new Date().toISOString()}]\x1b[0m ${msg}`, ...args);
  },
  error: (msg, err, ...args) => {
    console.error(`\x1b[31m[ERROR] [${new Date().toISOString()}]\x1b[0m ${msg}`, err || '', ...args);
  }
};
