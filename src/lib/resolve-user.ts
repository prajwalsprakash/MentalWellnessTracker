import { db } from "./db";

/**
 * Resolves the internal database user by their Clerk ID.
 * Creates the user record if it does not already exist.
 */
export async function resolveUser(clerkId: string): Promise<{ id: string }> {
  if (!clerkId) {
    throw new Error("Clerk ID is required to resolve user");
  }

  let user = await db.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        clerkId,
        targetExam: "",
        targetDate: new Date(),
      },
      select: { id: true },
    });
  }

  return user;
}
