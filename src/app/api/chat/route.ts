// ─────────────────────────────────────────────────────────────
// POST /api/chat — Streaming AI Companion
//
// Streams Gemini responses in real-time using the Vercel AI SDK.
// Enforces Clerk auth, loads user's target exam for context,
// and applies the liability guardrail system prompt.
// ─────────────────────────────────────────────────────────────

import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { geminiModel, geminiSafetySettings, buildCompanionSystemPrompt } from "@/lib/gemini";
import { detectCrisis, CRISIS_RESPONSE_MESSAGE } from "@/lib/crisis-detection";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

export const maxDuration = 30; // Vercel serverless timeout

// Zod schema to validate incoming chat request
const ChatMessageSchema = z.object({
  id: z.string().max(100).optional(),
  role: z.enum(["user", "assistant", "system", "data"]),
  content: z.string().max(5000).optional().default(""),
  parts: z.array(z.any()).optional(),
});

const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(100),
});

export async function POST(req: Request) {
  try {
    // ── Auth gate ──────────────────────────────────────────
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Rate limiting ──────────────────────────────────────
    const rateLimitKey = `rate_limit:chat:${clerkId}`;
    const limitResult = rateLimit(rateLimitKey, 5, 60000); // 5 requests per minute
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

    // ── Parse and validate request body ────────────────────
    let body: any;
    try {
      body = await req.json();
    } catch {
      return Response.json(
        { error: "Malformed JSON request body" },
        { status: 400 }
      );
    }

    const validation = ChatRequestSchema.safeParse(body);
    if (!validation.success) {
      console.error("[/api/chat] Validation error:", JSON.stringify(validation.error.format(), null, 2));
      console.error("[/api/chat] Raw body:", JSON.stringify(body, null, 2));
      return Response.json(
        { error: "Invalid chat messages data" },
        { status: 400 }
      );
    }

    const messages = validation.data.messages;

    // ── Crisis check on the latest user message ──────────
    const latestUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");

    if (latestUserMessage) {
      let textContent = "";
      if (latestUserMessage.parts && Array.isArray(latestUserMessage.parts)) {
        textContent = latestUserMessage.parts
          .filter((p) => p && typeof p === "object" && p.type === "text" && typeof p.text === "string")
          .map((p) => p.text)
          .join(" ");
      }
      if (!textContent) {
        textContent = latestUserMessage.content || "";
      }

      const sanitizedText = sanitizeText(textContent, 5000);

      const crisisResult = detectCrisis(sanitizedText);
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
    const modelMessages = await convertToModelMessages(messages as UIMessage[]);

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
