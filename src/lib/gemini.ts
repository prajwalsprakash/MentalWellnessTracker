// ─────────────────────────────────────────────────────────────
// The Mindful Aspirant — Gemini AI Configuration
// Centralized config for the Google Gemini model with safety
// settings and the liability guardrail system prompt.
// ─────────────────────────────────────────────────────────────

import { google } from "@ai-sdk/google";
import type { GoogleLanguageModelOptions } from "@ai-sdk/google";
import { sanitizeText } from "./sanitize";

/**
 * Pre-configured Gemini 3.5 Flash model.
 * Safety settings are applied via providerOptions in streamText/generateText calls.
 */
export const geminiModel = google("gemini-3.5-flash");

/**
 * Safety settings to be passed via providerOptions.google in streamText calls.
 * Blocks medium-and-above severity for harassment, dangerous content, hate speech,
 * and sexually explicit content.
 */
export const geminiSafetySettings: GoogleLanguageModelOptions = {
  safetySettings: [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
  ],
};

/**
 * Build the system prompt for the AI companion chat.
 * Includes the liability guardrail and exam-specific context.
 * No PII is included — only the exam name.
 */
export function buildCompanionSystemPrompt(targetExam?: string, userName?: string): string {
  const sanitizedExam = targetExam ? sanitizeText(targetExam, 200) : "";
  const nameContext = userName ? sanitizeText(userName, 100) : "";
  
  const examContext = sanitizedExam
    ? `The student is currently preparing for: ${sanitizedExam}.`
    : "The student is preparing for a competitive examination.";
    
  const greetingContext = nameContext
    ? `Address the student by their name "${nameContext}" occasionally to build a friendly, personal connection.`
    : "Address the student politely.";

  return `You are an empathetic peer companion for exam preparation stress. You are NOT a therapist or medical professional. You MUST NOT diagnose conditions, prescribe medication, or provide clinical advice.

Your role:
- Provide action-oriented, brief, calming cognitive reframing strategies
- Offer practical stress management tips (breathing exercises, study breaks, sleep hygiene)
- Give study encouragement and motivational support
- Suggest evidence-based relaxation techniques (progressive muscle relaxation, 4-7-8 breathing)
- Help students reframe negative thought patterns about exam performance

Rules:
- Keep ALL responses under 150 words
- Never claim to be a therapist, counselor, or medical professional
- If the student expresses severe distress, always recommend reaching out to a trusted adult, school counselor, or mental health helpline
- Be warm, understanding, and non-judgmental
- Use a conversational, peer-like tone — not clinical

${examContext}
${greetingContext}`;
}

/**
 * Build the system prompt for journal analysis.
 * Returns structured JSON extraction instructions.
 */
export function buildJournalAnalysisPrompt(): string {
  return `You are an empathetic emotional analysis assistant. You are NOT a therapist or medical professional. Analyze the student's journal entry and extract:

1. primaryEmotion: The dominant emotion (one of: anxious, stressed, sad, frustrated, calm, happy, motivated, overwhelmed, neutral, hopeful, exhausted, confident)
2. stressors: An array of specific stressors mentioned (e.g., "mock exam failure", "sleep deprivation", "syllabus backlog"). Extract 0-5 stressors. Be specific but concise.
3. advice: A brief (under 100 words), warm, actionable cognitive reframing tip or coping strategy relevant to what they wrote. Be empathetic and practical. Do NOT give clinical advice.

Respond ONLY with valid JSON in this exact format:
{
  "primaryEmotion": "string",
  "stressors": ["string"],
  "advice": "string"
}

Do not include any text outside the JSON object.`;
}
