import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import pkg from "pg";
import { logger } from "../src/utils/logger.js"; // Adjust path if needed
const { Pool } = pkg;

// Function to generate a random secret key
function generateSecretKey() {
  return crypto.randomBytes(64).toString("hex");
}

// Run the script with proper error handling
async function run() {
  try {
    logger.info("Starting environment configuration generation");
    
    // Generate a consistent secret for both JWT and access token if desired
    const sharedSecret = generateSecretKey();
    
    // Define the database name to be used consistently
    const DB_NAME = "financialdb"; // Using lowercase to avoid case sensitivity issues
    
    // Define the .env file content
    const envContent = `PORT=5000
      DATABASE_URL="postgresql://postgres:NiewinPas%24953%23%40699@localhost:5432/${DB_NAME}"
      REDIS_URL=redis://192.168.50.131:6379
      ACCESS_TOKEN_SECRET="${sharedSecret}"
      JWT_SECRET="${sharedSecret}"
      REFRESH_TOKEN_SECRET="${generateSecretKey()}"
      CLIENT_URL=http://localhost:5173
      NODE_ENV=development
      `;
    
    // Force-create the .env file (overwrite if exists)
    try {
      fs.writeFileSync(".env", envContent);
      logger.info(".env file generated successfully");
      logger.debug("Environment file contents", { 
        content: envContent.replace(/([A-Z_]+_SECRET=")([^"]+)(")/g, '$1[REDACTED]$3') // Redact secrets in logs
      });
    } catch (error) {
      logger.error("Failed to write .env file", {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
    
    // Get directory name of current module
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Load environment variables from the .env file
    const envPath = path.join(__dirname, "../.env"); // Fix path to point to root directory
    if (fs.existsSync(envPath)) {
      logger.debug(`Loading environment from: ${envPath}`);
      dotenv.config({ path: envPath });
    } else {
      logger.warn(`Warning: .env file not found at ${envPath}`);
      dotenv.config(); // Try default .env loading
    }
    
    await checkEnvironmentVariables();
    
    logger.info("Environment configuration completed successfully");
  } catch (error) {
    logger.error("Failed to configure environment", {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Function to check environment variables
const checkEnvironmentVariables = async () => {
  logger.info("Starting environment variables check");

  const requiredVars = [
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "DATABASE_URL",
    "REDIS_URL",
  ];

  let hasErrors = false;

  // Check each required variable
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      logger.error(`Missing required environment variable`, { variable: varName });
      hasErrors = true;
    } else {
      logger.debug(`Environment variable is defined`, { variable: varName });
    }
  }

  // Check if JWT_SECRET and ACCESS_TOKEN_SECRET are identical
  if (process.env.JWT_SECRET !== process.env.ACCESS_TOKEN_SECRET) {
    logger.warn("JWT_SECRET and ACCESS_TOKEN_SECRET have different values");
  } else {
    logger.debug("JWT_SECRET and ACCESS_TOKEN_SECRET match");
  }

  // Validate PostgreSQL connection string
  if (process.env.DATABASE_URL) {
    if (!process.env.DATABASE_URL.startsWith("postgresql://")) {
      logger.warn("DATABASE_URL is not a valid PostgreSQL URL");
      hasErrors = true;
    } else {
      try {
        // Extract database name from DATABASE_URL to handle case sensitivity properly
        const dbUrlParts = process.env.DATABASE_URL.split("/");
        const targetDbName = dbUrlParts[dbUrlParts.length - 1];
        
        logger.debug("Checking database connection", { 
          targetDatabase: targetDbName 
        });
        
        // Connect to default postgres database
        const pgPool = new Pool({
          connectionString: process.env.DATABASE_URL.replace(new RegExp(`/${targetDbName}$`), "/postgres")
        });
        
        // Check if our database exists (case-insensitive)
        const dbCheckResult = await pgPool.query(
          "SELECT datname FROM pg_database WHERE LOWER(datname) = LOWER($1)",
          [targetDbName]
        );
        
        if (dbCheckResult.rows.length === 0) {
          logger.info(`Database '${targetDbName}' does not exist, creating it now`);
          await pgPool.query(`CREATE DATABASE ${targetDbName}`);
          logger.info(`Database created successfully`, { database: targetDbName });
        } else {
          const actualDbName = dbCheckResult.rows[0].datname;
          logger.info(`Database exists`, { 
            actualName: actualDbName, 
            targetName: targetDbName 
          });
          
          // Update DATABASE_URL if needed to match actual database name
          if (actualDbName !== targetDbName) {
            const newDbUrl = process.env.DATABASE_URL.replace(new RegExp(`/${targetDbName}$`), `/${actualDbName}`);
            process.env.DATABASE_URL = newDbUrl;
            logger.info(`Updated DATABASE_URL to use existing database name`, { 
              databaseName: actualDbName 
            });
          }
        }
        
        await pgPool.end();
        
        // Now connect to the actual target database to verify connection
        const appPool = new Pool({
          connectionString: process.env.DATABASE_URL,
        });
        await appPool.query("SELECT 1"); // Test query
        logger.info("PostgreSQL connection test successful");
        await appPool.end();
      } catch (error) {
        logger.error("PostgreSQL connection test failed", {
          error: error.message,
          stack: error.stack,
          hint: "Make sure PostgreSQL server is running and accessible"
        });
        hasErrors = true;
      }
    }
  }

  // Final environment validation message  
  if (hasErrors) {
    logger.error("Environment validation failed, fix issues before running the app");

    const environment = process.env.NODE_ENV || "development";
    const envFile = `.env.${environment}`;

    logger.debug(`Trying to load environment-specific file`, { file: envFile });
    dotenv.config({ path: envFile });

    if (process.env.NODE_ENV === "production") {
      logger.error("Exiting process due to missing environment variables in production mode");
      process.exit(1);
    }
  } else {
    logger.info("All required environment variables are properly set");
  }

  return !hasErrors;
};

// Run the script
run();