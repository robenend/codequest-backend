import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function logUserAction(userId, action) {
  try {
    // Save log to the database
    await prisma.log.create({
      data: {
        userId,
        action,
      },
    });
  } catch (error) {
    console.error("Failed to log user action:", error);
  }
}
