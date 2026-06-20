// ─────────────────────────────────────────────────────────────
// /api/user — User Profile Management
//
// POST: Create or update user profile (target exam, date)
// GET:  Retrieve current user profile
// ─────────────────────────────────────────────────────────────

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db";

const UserProfileSchema = z.object({
  targetExam: z.string().min(1).max(200),
  targetDate: z.string().refine((d) => !isNaN(Date.parse(d)), {
    message: "Invalid date format",
  }),
});

// ── POST: Create or update user profile ──────────────────────
export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = UserProfileSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: "Invalid profile data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const user = await db.user.upsert({
      where: { clerkId },
      update: {
        targetExam: validation.data.targetExam,
        targetDate: new Date(validation.data.targetDate),
      },
      create: {
        clerkId,
        targetExam: validation.data.targetExam,
        targetDate: new Date(validation.data.targetDate),
      },
    });

    return Response.json({
      id: user.id,
      targetExam: user.targetExam,
      targetDate: user.targetDate,
      success: true,
    });
  } catch (error) {
    console.error("[/api/user POST] Error:", error);
    return Response.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

// ── GET: Retrieve user profile ───────────────────────────────
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        targetExam: true,
        targetDate: true,
        createdAt: true,
      },
    });

    if (!user) {
      return Response.json({ user: null, isNewUser: true });
    }

    return Response.json({
      user,
      isNewUser: !user.targetExam,
    });
  } catch (error) {
    console.error("[/api/user GET] Error:", error);
    return Response.json(
      { error: "Failed to retrieve profile" },
      { status: 500 }
    );
  }
}
