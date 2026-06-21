import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "../../app/api/mood/route";
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
      moodLog: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
    },
  };
});

describe("Mood API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimit("rate_limit:mood_post:clerk-123");
    resetRateLimit("rate_limit:mood_get:clerk-123");
  });

  describe("POST", () => {
    it("should return 401 if unauthorized", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      
      const req = new Request("http://localhost/api/mood", {
        method: "POST",
        body: JSON.stringify({ score: 4 }),
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 for invalid mood data", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "clerk-123" } as any);

      const req = new Request("http://localhost/api/mood", {
        method: "POST",
        body: JSON.stringify({ score: 10 }), // Invalid score > 5
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Invalid mood data");
    });

    it("should successfully log a valid mood and return 201", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "clerk-123" } as any);
      vi.mocked(db.user.findUnique).mockResolvedValue({ id: "user-abc" } as any);
      vi.mocked(db.moodLog.create).mockResolvedValue({ id: "log-1", score: 4, tags: ["stressed"] } as any);

      const req = new Request("http://localhost/api/mood", {
        method: "POST",
        body: JSON.stringify({ score: 4, tags: ["stressed"] }),
      });
      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.id).toBe("log-1");

      expect(db.moodLog.create).toHaveBeenCalledWith({
        data: {
          userId: "user-abc",
          score: 4,
          tags: ["stressed"],
        },
      });
    });
  });

  describe("GET", () => {
    it("should return mood history", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "clerk-123" } as any);
      vi.mocked(db.user.findUnique).mockResolvedValue({ id: "user-abc" } as any);
      
      const mockMoods = [
        { id: "log-1", score: 3, tags: [], createdAt: new Date() },
      ];
      vi.mocked(db.moodLog.findMany).mockResolvedValue(mockMoods as any);

      const req = new Request("http://localhost/api/mood?days=5");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.moods).toHaveLength(1);
      expect(data.moods[0].id).toBe("log-1");
    });

    it("should default to 7 days if days query param is invalid", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "clerk-123" } as any);
      vi.mocked(db.user.findUnique).mockResolvedValue({ id: "user-abc" } as any);
      vi.mocked(db.moodLog.findMany).mockResolvedValue([] as any);

      const req = new Request("http://localhost/api/mood?days=invalid");
      const res = await GET(req);
      expect(res.status).toBe(200);
      expect(db.moodLog.findMany).toHaveBeenCalled();
    });
  });
});
