// ─────────────────────────────────────────────────────────────
// /api/user — User Profile Management
//
// POST: Create or update user profile (target exam, date)
// GET:  Retrieve current user profile
// ─────────────────────────────────────────────────────────────

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

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

    // ── Rate limiting ──────────────────────────────────────
    const rateLimitKey = `rate_limit:user_post:${clerkId}`;
    const limitResult = rateLimit(rateLimitKey, 30, 60000); // 30 requests per minute
    if (!limitResult.success) {
      return Response.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(limitResult.resetMs / 1000).toString(),
          },
        }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return Response.json(
        { error: "Malformed JSON request body" },
        { status: 400 }
      );
    }

    const validation = UserProfileSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        { error: "Invalid profile data" },
        { status: 400 }
      );
    }

    // Sanitize target exam string before storage to prevent 2nd-order prompt injection
    const sanitizedExam = sanitizeText(validation.data.targetExam, 200);

    const user = await db.user.upsert({
      where: { clerkId },
      update: {
        targetExam: sanitizedExam,
        targetDate: new Date(validation.data.targetDate),
      },
      create: {
        clerkId,
        targetExam: sanitizedExam,
        targetDate: new Date(validation.data.targetDate),
      },
    });

    return Response.json({
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

    // ── Rate limiting ──────────────────────────────────────
    const rateLimitKey = `rate_limit:user_get:${clerkId}`;
    const limitResult = rateLimit(rateLimitKey, 30, 60000); // 30 requests per minute
    if (!limitResult.success) {
      return Response.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      select: {
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
