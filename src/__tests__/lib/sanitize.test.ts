import { describe, it, expect } from "vitest";
import {
  sanitizeText,
  sanitizeTag,
  sanitizeForPrompt,
} from "../../lib/sanitize";

describe("Sanitization Utilities", () => {
  describe("sanitizeText", () => {
    it("should strip simple HTML tags", () => {
      const input = "<p>Hello <b>world</b>!</p>";
      expect(sanitizeText(input, 100)).toBe("Hello world!");
    });

    it("should trim surrounding whitespace", () => {
      const input = "   Calm mind   ";
      expect(sanitizeText(input, 100)).toBe("Calm mind");
    });

    it("should slice input to max length", () => {
      const input = "Very long text that should be sliced";
      expect(sanitizeText(input, 10)).toBe("Very long ");
    });

    it("should return empty string for non-string types", () => {
      expect(sanitizeText(null as any, 10)).toBe("");
      expect(sanitizeText(undefined as any, 10)).toBe("");
    });
  });

  describe("sanitizeTag", () => {
    it("should allow alphanumeric, spaces, and hyphens", () => {
      const input = "Anxious-mind 101";
      expect(sanitizeTag(input)).toBe("Anxious-mind 101");
    });

    it("should strip special characters", () => {
      const input = "anxious!@#$ tag %^&*";
      expect(sanitizeTag(input)).toBe("anxious tag");
    });

    it("should trim and cap to 50 characters", () => {
      const longTag = "a".repeat(100);
      expect(sanitizeTag(longTag)).toHaveLength(50);
    });
  });

  describe("sanitizeForPrompt", () => {
    it("should escape backticks to avoid prompt escaping bugs", () => {
      const input = "User said `hello` to helper";
      expect(sanitizeForPrompt(input)).toBe("User said \\`hello\\` to helper");
    });

    it("should strip potential dangerous HTML/XML structures", () => {
      const input = "<script>alert(1)</script> Hello <custom-tag>friend</custom-tag>";
      // Expect general HTML tags to be stripped
      expect(sanitizeForPrompt(input)).toBe("alert(1) Hello friend");
    });
  });
});
