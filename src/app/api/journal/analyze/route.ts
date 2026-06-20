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

// Zod schema to validate Gemini's JSON response
const AnalysisSchema = z.object({
  primaryEmotion: z.string(),
  stressors: z.array(z.string()),
  advice: z.string(),
});

export async function POST(req: Request) {
  try {
    // ── Auth gate ──────────────────────────────────────────
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { text } = body;

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

    // ── Resolve internal user ID ─────────────────────────
    let user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    // Auto-create user if first interaction
    if (!user) {
      user = await db.user.create({
        data: { clerkId, targetExam: "", targetDate: new Date() },
        select: { id: true },
      });
    }

    // ── Crisis check FIRST (before sending to AI) ────────
    const crisisResult = detectCrisis(text);
    if (crisisResult.isCrisis) {
      // Save the entry as a crisis entry
      const entry = await db.journalEntry.create({
        data: {
          userId: user.id,
          text,
          primaryEmotion: "crisis",
          stressors: crisisResult.matchedPatterns,
          advice: CRISIS_RESPONSE_MESSAGE,
          isCrisis: true,
        },
      });

      return Response.json({
        id: entry.id,
        primaryEmotion: "crisis",
        stressors: crisisResult.matchedPatterns,
        advice: CRISIS_RESPONSE_MESSAGE,
        isCrisis: true,
        helplines: CRISIS_HELPLINES,
      });
    }

    // ── Send sanitized text to Gemini for analysis ───────
    // NOTE: We do NOT send user ID, name, email, or any PII.
    // Only the raw journal text is sent for emotion analysis.
    const { text: aiResponse } = await generateText({
      model: geminiModel,
      system: buildJournalAnalysisPrompt(),
      prompt: `Analyze this student journal entry:\n\n"${text.slice(0, 5000)}"`,
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
        text,
        primaryEmotion: analysis.primaryEmotion,
        stressors: analysis.stressors,
        advice: analysis.advice,
        isCrisis: false,
      },
    });

    return Response.json({
      id: entry.id,
      primaryEmotion: analysis.primaryEmotion,
      stressors: analysis.stressors,
      advice: analysis.advice,
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
