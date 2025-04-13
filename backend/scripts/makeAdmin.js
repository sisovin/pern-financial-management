import { prisma } from "../src/config/db.js";
import "../src/config/dotenv.js";
import { logger } from "../src/utils/logger.js";

async function makeAdmin(email) {
  try {
    logger.info("Starting makeAdmin process", { email });
    
    // Find the user
    logger.debug("Looking up user", { email });
    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    });

    if (!user) {
      logger.error("User not found", { email });
      return false;
    }
    
    logger.debug("User found", { 
      userId: user.id, 
      email, 
      currentRoles: user.roles.map(r => r.name) 
    });

    // Find the ADMIN role
    logger.debug("Looking up ADMIN role");
    const adminRole = await prisma.role.findFirst({
      where: { name: "ADMIN" },
    });

    if (!adminRole) {
      logger.error("ADMIN role not found in the database");
      return false;
    }

    // Check if user already has admin role
    const isAlreadyAdmin = user.roles.some((role) => role.id === adminRole.id);

    if (isAlreadyAdmin) {
      logger.info("User is already an admin, no changes needed", { 
        userId: user.id, 
        email 
      });
      return true;
    }

    // Assign admin role
    logger.debug("Assigning admin role to user", { 
      userId: user.id, 
      email, 
      roleId: adminRole.id 
    });
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        roles: {
          connect: [{ id: adminRole.id }],
        },
      },
    });

    logger.info("Successfully made user an admin", { 
      userId: user.id, 
      email 
    });
    return true;
  } catch (error) {
    logger.error("Error during makeAdmin process", {
      email,
      error: error.message,
      stack: error.stack
    });
    return false;
  } finally {
    try {
      logger.debug("Disconnecting from database");
      await prisma.$disconnect();
    } catch (disconnectError) {
      logger.error("Error disconnecting from database", {
        error: disconnectError.message
      });
    }
  }
}

async function run() {
  // Get email from command line argument
  const email = process.argv[2];

  if (!email) {
    logger.error("No email address provided");
    process.exit(1);
  }

  logger.info("Executing makeAdmin script", { email });
  
  try {
    const success = await makeAdmin(email);
    
    if (success) {
      logger.info("Operation completed successfully");
      process.exit(0);
    } else {
      logger.error("Operation failed");
      process.exit(1);
    }
  } catch (error) {
    logger.error("Unhandled exception in makeAdmin script", {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Execute the script
run();