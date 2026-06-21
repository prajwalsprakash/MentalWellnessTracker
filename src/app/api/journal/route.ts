// ─────────────────────────────────────────────────────────────
// /api/journal — Journal Entries Retrieval
//
// GET: Retrieve past reflections for the authenticated user
// ─────────────────────────────────────────────────────────────

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { resolveUser } from "@/lib/resolve-user";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Rate limiting ──────────────────────────────────────
    const rateLimitKey = `rate_limit:journal_get:${clerkId}`;
    const limitResult = rateLimit(rateLimitKey, 30, 60000); // 30 requests per minute
    if (!limitResult.success) {
      return Response.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Resolve user internal ID
    const user = await resolveUser(clerkId);

    const entries = await db.journalEntry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        text: true,
        primaryEmotion: true,
        isCrisis: true,
        createdAt: true,
      },
    });

    return Response.json({ entries });
  } catch (error) {
    console.error("[/api/journal GET] Error:", error);
    return Response.json(
      { error: "Failed to retrieve reflections" },
      { status: 500 }
    );
  }
}
