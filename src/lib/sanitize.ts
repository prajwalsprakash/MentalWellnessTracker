/**
 * Input Sanitization Utilities
 */

/**
 * Strips HTML tags, trims whitespace, and limits text length.
 */
export function sanitizeText(input: string, maxLen: number): string {
  if (typeof input !== "string") return "";
  
  // Basic HTML tag stripping
  const stripped = input.replace(/<[^>]*>/g, "");
  
  // Trim and slice
  return stripped.trim().slice(0, maxLen);
}

/**
 * Sanitizes tag inputs to only allow alphanumeric characters, spaces, and hyphens.
 * Limits to 50 characters.
 */
export function sanitizeTag(tag: string): string {
  if (typeof tag !== "string") return "";
  
  // Keep only letters, numbers, spaces, and hyphens
  const cleaned = tag.replace(/[^a-zA-Z0-9\s-]/g, "");
  
  return cleaned.trim().slice(0, 50);
}

/**
 * Sanitizes and wraps user text to prevent prompt injection.
 * Replaces backticks and XML-like tags to prevent prompt payload breaking.
 */
export function sanitizeForPrompt(text: string): string {
  if (typeof text !== "string") return "";
  
  // Escape backticks and XML tag structures to make sure LLM parses it as a literal string
  const cleaned = text
    .replace(/`/g, "\\`")
    .replace(/<(\/?script|\/?iframe|\/?object|\/?embed|\/?applet)>/gi, "")
    .replace(/<\/?[a-z][a-z0-9]*[^<>]*>/gi, ""); // Strip any general XML/HTML tags
    
  return cleaned.trim();
}
