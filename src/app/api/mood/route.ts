// ─────────────────────────────────────────────────────────────
// /api/mood — Mood Logging Endpoints
//
// POST: Log a new mood score (1-5) with optional tags
// GET:  Retrieve mood history for the authenticated user
// ─────────────────────────────────────────────────────────────

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { resolveUser } from "@/lib/resolve-user";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeTag } from "@/lib/sanitize";

const MoodLogSchema = z.object({
  score: z.number().int().min(1).max(5),
  tags: z.array(z.string().max(50)).max(10).default([]),
});

// ── POST: Log a mood entry ───────────────────────────────────
export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Rate limiting ──────────────────────────────────────
    const rateLimitKey = `rate_limit:mood_post:${clerkId}`;
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

    const validation = MoodLogSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        { error: "Invalid mood data" },
        { status: 400 }
      );
    }

    // Sanitize tags
    const sanitizedTags = validation.data.tags.map((tag) => sanitizeTag(tag));

    // Resolve internal user ID, auto-create if needed
    const user = await resolveUser(clerkId);

    const moodLog = await db.moodLog.create({
      data: {
        userId: user.id,
        score: validation.data.score,
        tags: sanitizedTags,
      },
    });

    return Response.json({ id: moodLog.id, success: true }, { status: 201 });
  } catch (error) {
    console.error("[/api/mood POST] Error:", error);
    return Response.json(
      { error: "Failed to log mood" },
      { status: 500 }
    );
  }
}

// ── GET: Retrieve mood history ───────────────────────────────
export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Rate limiting ──────────────────────────────────────
    const rateLimitKey = `rate_limit:mood_get:${clerkId}`;
    const limitResult = rateLimit(rateLimitKey, 30, 60000); // 30 requests per minute
    if (!limitResult.success) {
      return Response.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const parsedDays = parseInt(searchParams.get("days") || "7", 10);
    const days = Math.min(isNaN(parsedDays) ? 7 : parsedDays, 90);

    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return Response.json({ moods: [] });
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    const moods = await db.moodLog.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        score: true,
        tags: true,
        createdAt: true,
      },
    });

    return Response.json({ moods });
  } catch (error) {
    console.error("[/api/mood GET] Error:", error);
    return Response.json(
      { error: "Failed to retrieve mood history" },
      { status: 500 }
    );
  }
}
