import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';

/**
 * Manual log rotation utility
 * @param {string} logDir - Directory containing log files
 * @param {number} maxSize - Maximum file size in bytes before rotation
 * @param {number} maxFiles - Maximum number of log files to keep
 */
const rotateLog = (logDir, maxSize = 20 * 1024 * 1024, maxFiles = 14) => {
  try {
    // Ensure logDir exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
      return;
    }

    // Get all log files
    const logFiles = fs.readdirSync(logDir)
      .filter(file => file.endsWith('.log'))
      .map(file => ({
        name: file,
        path: path.join(logDir, file),
        createdAt: fs.statSync(path.join(logDir, file)).ctime,
        size: fs.statSync(path.join(logDir, file)).size
      }))
      .sort((a, b) => b.createdAt - a.createdAt);

    // Rotate if size exceeds maxSize
    logFiles.forEach(file => {
      if (file.size > maxSize) {
        const date = new Date().toISOString().replace(/[:.]/g, '-');
        const newPath = `${file.path}.${date}.old`;
        fs.renameSync(file.path, newPath);
        logger.info(`Rotated log file: ${file.path} -> ${newPath}`);
      }
    });

    // Delete old files if count exceeds maxFiles
    if (logFiles.length > maxFiles) {
      const filesToDelete = logFiles.slice(maxFiles);
      filesToDelete.forEach(file => {
        try {
          fs.unlinkSync(file.path);
          logger.info(`Deleted old log file: ${file.path}`);
        } catch (err) {
          logger.error(`Failed to delete old log file: ${file.path}`, { error: err.message });
        }
      });
    }
  } catch (error) {
    logger.error('Error in log rotation', { error: error.message, stack: error.stack });
  }
};

export default rotateLog;