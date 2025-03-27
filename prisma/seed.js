// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import { logger } from "../src/utils/logger.js";

const prisma = new PrismaClient();

async function main() {
  logger.info("Starting database seeding...");

  // Create roles if they don't exist
  const roles = [
    {
      name: "USER",
      description: "Regular user with standard permissions",
    },
    {
      name: "ADMIN",
      description: "Administrator with full access to all features",
    },
  ];

  logger.info("Creating roles...", { count: roles.length });

  for (const role of roles) {
    try {
      const existingRole = await prisma.role.findFirst({
        where: { name: role.name },
      });

      if (!existingRole) {
        await prisma.role.create({
          data: role,
        });
        logger.info(`Role created`, { role: role.name });
      } else {
        logger.debug(`Role already exists`, { role: role.name });
      }
    } catch (error) {
      logger.error(`Error creating role`, {
        role: role.name,
        error: error.message,
        stack: error.stack,
      });
      // Continue with other roles instead of letting the whole seeding fail
    }
  }

  // Add more seeding operations here
  try {
    // For example, create default permissions, categories, etc.
    logger.info("Creating additional seed data...");

    // Your additional seeding code here
  } catch (error) {
    logger.error("Error creating additional seed data", {
      error: error.message,
      stack: error.stack,
    });
  }

  logger.info("Database seeding completed successfully");
}

main()
  .catch((e) => {
    logger.error("Fatal error during database seeding", {
      error: e.message,
      stack: e.stack,
    });
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
      logger.debug("Prisma client disconnected");
    } catch (error) {
      logger.error("Error disconnecting Prisma client", {
        error: error.message,
      });
    }
  });