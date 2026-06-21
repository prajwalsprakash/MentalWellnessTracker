// ─────────────────────────────────────────────────────────────
// POST /api/journal/analyze — Journal Entry Analysis
//
// Accepts a journal entry, checks for crisis content, then
// sends to Gemini for emotion/stressor/advice extraction.
// Saves the result to the database.
// ─────────────────────────────────────────────────────────────

import { generateText } from "ai";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { geminiModel, geminiSafetySettings, buildJournalAnalysisPrompt } from "@/lib/gemini";
import {
  detectCrisis,
  CRISIS_RESPONSE_MESSAGE,
  CRISIS_HELPLINES,
} from "@/lib/crisis-detection";
import { sanitizeText, sanitizeForPrompt } from "@/lib/sanitize";
import { resolveUser } from "@/lib/resolve-user";
import { rateLimit } from "@/lib/rate-limit";

export const maxDuration = 30; // Vercel serverless timeout

// Zod schema to validate Gemini's JSON response (hardened strings)
const AnalysisSchema = z.object({
  primaryEmotion: z.string().max(50),
  stressors: z.array(z.string().max(100)).max(10),
  advice: z.string().max(1000),
});

export async function POST(req: Request) {
  try {
    // ── Auth gate ──────────────────────────────────────────
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Rate limiting ──────────────────────────────────────
    const rateLimitKey = `rate_limit:journal:${clerkId}`;
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

    // ── Parse request body ─────────────────────────────────
    let text = "";
    try {
      const body = await req.json();
      text = body.text;
    } catch {
      return Response.json(
        { error: "Malformed JSON request body" },
        { status: 400 }
      );
    }

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return Response.json(
        { error: "Journal text is required" },
        { status: 400 }
      );
    }

    if (text.length > 10000) {
      return Response.json(
        { error: "Journal entry exceeds maximum length of 10,000 characters" },
        { status: 400 }
      );
    }

    // Sanitize input text before storage and usage
    const sanitizedText = sanitizeText(text, 10000);

    // ── Resolve internal user ID ─────────────────────────
    const user = await resolveUser(clerkId);

    // ── Crisis check FIRST (before sending to AI) ────────
    const crisisResult = detectCrisis(sanitizedText);
    if (crisisResult.isCrisis) {
      // Save the entry as a crisis entry (mask/exclude matched patterns from stressors to protect privacy)
      const entry = await db.journalEntry.create({
        data: {
          userId: user.id,
          text: sanitizedText,
          primaryEmotion: "crisis",
          stressors: ["crisis-trigger"],
          advice: CRISIS_RESPONSE_MESSAGE,
          isCrisis: true,
        },
      });

      return Response.json({
        id: entry.id,
        primaryEmotion: "crisis",
        stressors: ["crisis-trigger"],
        advice: CRISIS_RESPONSE_MESSAGE,
        isCrisis: true,
        helplines: CRISIS_HELPLINES,
      });
    }

    // ── Send sanitized text to Gemini for analysis ───────
    // Prevent prompt injection by sanitizing and isolating prompt structure
    const promptText = sanitizeForPrompt(sanitizedText.slice(0, 5000));
    const { text: aiResponse } = await generateText({
      model: geminiModel,
      system: buildJournalAnalysisPrompt(),
      prompt: `Analyze this student journal entry:\n\n[START JOURNAL ENTRY]\n${promptText}\n[END JOURNAL ENTRY]`,
      providerOptions: {
        google: geminiSafetySettings,
      },
    });

    // ── Parse and validate Gemini response ───────────────
    let analysis: z.infer<typeof AnalysisSchema>;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }
      analysis = AnalysisSchema.parse(JSON.parse(jsonMatch[0]));
    } catch (parseError) {
      console.error("[/api/journal/analyze] Parse error:", parseError);
      // Fallback to safe defaults
      analysis = {
        primaryEmotion: "neutral",
        stressors: [],
        advice:
          "Thank you for sharing your thoughts. Taking time to reflect is a positive step. Consider taking a short break and doing something calming before returning to your studies.",
      };
    }

    // ── Save to database ─────────────────────────────────
    const entry = await db.journalEntry.create({
      data: {
        userId: user.id,
        text: sanitizedText,
        primaryEmotion: analysis.primaryEmotion.slice(0, 50),
        stressors: analysis.stressors.map((s) => s.slice(0, 100)).slice(0, 10),
        advice: analysis.advice.slice(0, 1000),
        isCrisis: false,
      },
    });

    return Response.json({
      id: entry.id,
      primaryEmotion: entry.primaryEmotion,
      stressors: entry.stressors,
      advice: entry.advice,
      isCrisis: false,
    });
  } catch (error) {
    console.error("[/api/journal/analyze] Error:", error);
    return Response.json(
      { error: "Failed to analyze journal entry" },
      { status: 500 }
    );
  }
}
