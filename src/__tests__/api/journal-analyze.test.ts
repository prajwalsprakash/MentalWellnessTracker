import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../../app/api/journal/analyze/route";
import { auth } from "@clerk/nextjs/server";
import { db } from "../../lib/db";
import { generateText } from "ai";
import { resetRateLimit } from "../../lib/rate-limit";

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => {
  return {
    auth: vi.fn(),
  };
});

// Mock database
vi.mock("../../lib/db", () => {
  return {
    db: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      journalEntry: {
        create: vi.fn(),
      },
    },
  };
});

// Mock AI SDK
vi.mock("ai", () => {
  return {
    generateText: vi.fn(),
  };
});

describe("Journal Analyze API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimit("rate_limit:journal:clerk-123");
  });

  it("should return 401 if unauthorized", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any);

    const req = new Request("http://localhost/api/journal/analyze", {
      method: "POST",
      body: JSON.stringify({ text: "Hello" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should return 400 if text is missing", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "clerk-123" } as any);

    const req = new Request("http://localhost/api/journal/analyze", {
      method: "POST",
      body: JSON.stringify({ text: "" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should block AI analysis and trigger crisis protocol if text contains crisis keywords", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "clerk-123" } as any);
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: "user-abc" } as any);
    vi.mocked(db.journalEntry.create).mockResolvedValue({ id: "entry-1" } as any);

    const req = new Request("http://localhost/api/journal/analyze", {
      method: "POST",
      body: JSON.stringify({ text: "I feel like committing suicide" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.isCrisis).toBe(true);
    expect(data.primaryEmotion).toBe("crisis");
    expect(data.helplines).toBeDefined();

    // Verify AI was NEVER called (critical security check)
    expect(generateText).not.toHaveBeenCalled();
    // Verify entry was saved to DB as crisis
    expect(db.journalEntry.create).toHaveBeenCalled();
  });

  it("should successfully pass safe entries to AI and save results to DB", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "clerk-123" } as any);
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: "user-abc" } as any);
    
    // Mock successful AI completion response
    vi.mocked(generateText).mockResolvedValue({
      text: JSON.stringify({
        primaryEmotion: "stressed",
        stressors: ["syllabus backlog"],
        advice: "Take a deep breath and start planning.",
      }),
    } as any);

    vi.mocked(db.journalEntry.create).mockResolvedValue({
      id: "entry-1",
      primaryEmotion: "stressed",
      stressors: ["syllabus backlog"],
      advice: "Take a deep breath and start planning.",
    } as any);

    const req = new Request("http://localhost/api/journal/analyze", {
      method: "POST",
      body: JSON.stringify({ text: "I have a lot of backlog of my class preparation" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.isCrisis).toBe(false);
    expect(data.primaryEmotion).toBe("stressed");
    expect(data.advice).toBe("Take a deep breath and start planning.");

    expect(generateText).toHaveBeenCalled();
    expect(db.journalEntry.create).toHaveBeenCalled();
  });
});
