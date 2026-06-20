// ─────────────────────────────────────────────────────────────
// /api/dashboard — Dashboard Data Aggregation
//
// GET: Returns weekly mood data, aggregated stressors,
//      and entry statistics for the authenticated user.
// ─────────────────────────────────────────────────────────────

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true, targetExam: true, targetDate: true },
    });

    if (!user) {
      return Response.json({
        moodData: [],
        stressTriggers: [],
        stats: { totalEntries: 0, avgMood: 0, streak: 0 },
        targetExam: "",
        targetDate: null,
      });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // ── Fetch weekly mood logs ───────────────────────────
    const moodLogs = await db.moodLog.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: sevenDaysAgo },
      },
      orderBy: { createdAt: "asc" },
      select: { score: true, createdAt: true },
    });

    // Group by day and average scores
    const moodByDay = new Map<string, { scores: number[]; date: string }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = DAY_NAMES[d.getDay()];
      moodByDay.set(key, {
        scores: [],
        date: d.toISOString().split("T")[0],
      });
    }

    for (const log of moodLogs) {
      const dayName = DAY_NAMES[log.createdAt.getDay()];
      const entry = moodByDay.get(dayName);
      if (entry) {
        entry.scores.push(log.score);
      }
    }

    const moodData = Array.from(moodByDay.entries()).map(([day, data]) => ({
      day,
      score:
        data.scores.length > 0
          ? Math.round(
              (data.scores.reduce((a, b) => a + b, 0) / data.scores.length) *
                10
            ) / 10
          : null,
      date: data.date,
    }));

    // ── Aggregate stressors from journal entries ─────────
    const journalEntries = await db.journalEntry.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: sevenDaysAgo },
      },
      select: { stressors: true },
    });

    const stressorCounts = new Map<string, number>();
    for (const entry of journalEntries) {
      for (const stressor of entry.stressors) {
        stressorCounts.set(
          stressor,
          (stressorCounts.get(stressor) || 0) + 1
        );
      }
    }

    const stressTriggers = Array.from(stressorCounts.entries())
      .map(([trigger, count]) => ({ trigger, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // ── Compute stats ────────────────────────────────────
    const totalEntries = await db.journalEntry.count({
      where: { userId: user.id },
    });

    const allScores = moodLogs.map((m) => m.score);
    const avgMood =
      allScores.length > 0
        ? Math.round(
            (allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10
          ) / 10
        : 0;

    // ── Fetch latest journal insight ─────────────────────
    const latestJournal = await db.journalEntry.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { advice: true, primaryEmotion: true, createdAt: true },
    });

    return Response.json({
      moodData,
      stressTriggers,
      stats: {
        totalEntries,
        avgMood,
        weeklyLogs: moodLogs.length,
      },
      latestInsight: latestJournal
        ? {
            advice: latestJournal.advice,
            emotion: latestJournal.primaryEmotion,
            createdAt: latestJournal.createdAt,
          }
        : null,
      targetExam: user.targetExam,
      targetDate: user.targetDate,
    });
  } catch (error) {
    console.error("[/api/dashboard GET] Error:", error);
    return Response.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
