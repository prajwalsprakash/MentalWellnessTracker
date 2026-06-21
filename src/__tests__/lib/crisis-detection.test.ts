import { describe, it, expect } from "vitest";
import {
  detectCrisis,
  CRISIS_HELPLINES,
  CRISIS_RESPONSE_MESSAGE,
} from "../../lib/crisis-detection";

describe("Crisis Detection Engine", () => {
  it("should return isCrisis: false for safe inputs", () => {
    const safeInputs = [
      "I am preparing for my final exam tomorrow.",
      "Just feeling a bit tired after a long study session.",
      "I need to work harder on my math syllabus.",
      "",
    ];

    for (const input of safeInputs) {
      const result = detectCrisis(input);
      expect(result.isCrisis).toBe(false);
      expect(result.matchedPatterns).toHaveLength(0);
    }
  });

  it("should match direct crisis keywords case-insensitively", () => {
    const triggerInputs = [
      "suicide",
      "I want to kill myself",
      "ending it all",
      "SUICIDAL thoughts today",
      "how to self-harm safely",
    ];

    for (const input of triggerInputs) {
      const result = detectCrisis(input);
      expect(result.isCrisis).toBe(true);
      expect(result.matchedPatterns.length).toBeGreaterThan(0);
    }
  });

  it("should match crisis patterns embedded in longer sentences", () => {
    const text = "Sometimes I feel like there is no reason to live because the exams are too hard.";
    const result = detectCrisis(text);
    expect(result.isCrisis).toBe(true);
    expect(result.matchedPatterns).toContain("no reason to live");
  });

  it("should export helper details and response message", () => {
    expect(CRISIS_HELPLINES.length).toBeGreaterThan(0);
    expect(CRISIS_RESPONSE_MESSAGE).toBeDefined();
    
    // Check structure of helplines
    const firstHelpline = CRISIS_HELPLINES[0];
    expect(firstHelpline).toHaveProperty("country");
    expect(firstHelpline).toHaveProperty("name");
    expect(firstHelpline).toHaveProperty("number");
  });
});
