import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../../app/api/journal/route";
import { auth } from "@clerk/nextjs/server";
import { db } from "../../lib/db";
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
        findMany: vi.fn(),
      },
    },
  };
});

describe("Journal API Route GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimit("rate_limit:journal_get:clerk-123");
  });

  it("should return 401 if unauthorized", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("should return past reflections if authorized", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "clerk-123" } as any);
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: "user-abc" } as any);

    const mockEntries = [
      {
        id: "entry-1",
        text: "I am feeling stressed",
        primaryEmotion: "stressed",
        isCrisis: false,
        createdAt: new Date(),
      },
    ];
    vi.mocked(db.journalEntry.findMany).mockResolvedValue(mockEntries as any);

    const res = await GET();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.entries).toHaveLength(1);
    expect(data.entries[0].id).toBe("entry-1");
  });
});
