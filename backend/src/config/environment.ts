// Environment variables setup

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..', '..');

/**
 * Initialize environment variables based on the current environment
 * @param {string} nodeEnv - Current environment (development, test, production)
 * @returns {void}
 */
const initEnv = (nodeEnv = process.env.NODE_ENV) => {
  // Determine which .env file to use
  let envPath = resolve(rootDir, '.env');
  
  if (nodeEnv) {
    const envSpecificPath = resolve(rootDir, `.env.${nodeEnv}`);
    if (fs.existsSync(envSpecificPath)) {
      envPath = envSpecificPath;
      console.log(`Loading environment variables from ${envPath}`);
    }
  }
  
  // Load environment variables
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    console.warn(`Warning: ${result.error.message}`);
    console.warn('Continuing with process.env and defaults');
  }
  
  // Validate required environment variables
  const requiredVars = [
    'PORT',
    'DATABASE_URL',
    'ACCESS_TOKEN_SECRET',
    'REFRESH_TOKEN_SECRET',
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`Missing required environment variables: ${missingVars.join(', ')}`);
    
    if (nodeEnv === 'production') {
      throw new Error('Missing required environment variables in production mode');
    }
  }
  
  // Set defaults for optional variables
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
  }
  
  if (!process.env.PORT) {
    process.env.PORT = '5000';
  }
  
  if (!process.env.CLIENT_URL) {
    process.env.CLIENT_URL = 'http://localhost:5173';
  }
};

// Initialize environment variables on module load
initEnv();

export default initEnv;
