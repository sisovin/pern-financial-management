// PostgreSQL database connection (Prisma)

import { PrismaClient } from "@prisma/client";
import "./environment.js"; // Import env configuration first

// Initialize Prisma client with logging in development mode
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

// Connect to the database with error handling
async function connectDB() {
  try {
    await prisma.$connect();
    console.log("Successfully connected to PostgreSQL database");
    return prisma;
  } catch (error) {
    console.error("Failed to connect to the database:", error.message);
    process.exit(1);
  }
}

// Disconnect from the database
async function disconnectDB() {
  try {
    await prisma.$disconnect();
    console.log("Successfully disconnected from PostgreSQL database");
  } catch (error) {
    console.error("Error disconnecting from database:", error.message);
    process.exit(1);
  }
}

// Handle application termination
process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnectDB();
  process.exit(0);
});

export { prisma, connectDB, disconnectDB };
export default prisma;
