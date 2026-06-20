// ─────────────────────────────────────────────────────────────
// /api/mood — Mood Logging Endpoints
//
// POST: Log a new mood score (1-5) with optional tags
// GET:  Retrieve mood history for the authenticated user
// ─────────────────────────────────────────────────────────────

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db";

const MoodLogSchema = z.object({
  score: z.number().int().min(1).max(5),
  tags: z.array(z.string()).max(10).default([]),
});

// ── POST: Log a mood entry ───────────────────────────────────
export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = MoodLogSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: "Invalid mood data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    // Resolve internal user ID, auto-create if needed
    let user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      user = await db.user.create({
        data: { clerkId, targetExam: "", targetDate: new Date() },
        select: { id: true },
      });
    }

    const moodLog = await db.moodLog.create({
      data: {
        userId: user.id,
        score: validation.data.score,
        tags: validation.data.tags,
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

    const { searchParams } = new URL(req.url);
    const days = Math.min(parseInt(searchParams.get("days") || "7"), 90);

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
