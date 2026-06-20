// ─────────────────────────────────────────────────────────────
// POST /api/chat — Streaming AI Companion
//
// Streams Gemini responses in real-time using the Vercel AI SDK.
// Enforces Clerk auth, loads user's target exam for context,
// and applies the liability guardrail system prompt.
// ─────────────────────────────────────────────────────────────

import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { geminiModel, geminiSafetySettings, buildCompanionSystemPrompt } from "@/lib/gemini";
import { detectCrisis, CRISIS_RESPONSE_MESSAGE } from "@/lib/crisis-detection";

export const maxDuration = 30; // Vercel serverless timeout

export async function POST(req: Request) {
  try {
    // ── Auth gate ──────────────────────────────────────────
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = (await req.json()) as { messages: UIMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Messages are required" }, { status: 400 });
    }

    // ── Crisis check on the latest user message ──────────
    const latestUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");

    if (latestUserMessage) {
      // Extract text from UIMessage parts
      const textContent =
        latestUserMessage.parts
          ?.filter(
            (p): p is { type: "text"; text: string } => p.type === "text"
          )
          .map((p) => p.text)
          .join(" ") || "";

      const crisisResult = detectCrisis(textContent);
      if (crisisResult.isCrisis) {
        return Response.json({
          isCrisis: true,
          message: CRISIS_RESPONSE_MESSAGE,
          helplines: true,
        });
      }
    }

    // ── Load user context (no PII sent to Gemini) ────────
    let targetExam: string | undefined;
    try {
      const user = await db.user.findUnique({
        where: { clerkId },
        select: { targetExam: true },
      });
      targetExam = user?.targetExam || undefined;
    } catch {
      // If DB is unavailable, proceed without exam context
    }

    // ── Convert UIMessages → ModelMessages for streamText ─
    const modelMessages = await convertToModelMessages(messages);

    // ── Stream from Gemini ───────────────────────────────
    const result = await streamText({
      model: geminiModel,
      system: buildCompanionSystemPrompt(targetExam),
      messages: modelMessages,
      providerOptions: {
        google: geminiSafetySettings,
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[/api/chat] Error:", error);
    return Response.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
