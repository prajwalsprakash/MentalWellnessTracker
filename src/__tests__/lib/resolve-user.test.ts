import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveUser } from "../../lib/resolve-user";
import { db } from "../../lib/db";

// Mock the db module
vi.mock("../../lib/db", () => {
  return {
    db: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    },
  };
});

describe("Resolve User Utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return the user if found in database", async () => {
    const mockUser = { id: "user-123" };
    vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as any);

    const result = await resolveUser("clerk-999");
    expect(result).toEqual(mockUser);
    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { clerkId: "clerk-999" },
      select: { id: true },
    });
    expect(db.user.create).not.toHaveBeenCalled();
  });

  it("should create and return user if not found in database", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null);
    const mockCreatedUser = { id: "new-user-123" };
    vi.mocked(db.user.create).mockResolvedValue(mockCreatedUser as any);

    const result = await resolveUser("clerk-999");
    expect(result).toEqual(mockCreatedUser);
    expect(db.user.findUnique).toHaveBeenCalled();
    expect(db.user.create).toHaveBeenCalledWith({
      data: {
        clerkId: "clerk-999",
        targetExam: "",
        targetDate: expect.any(Date),
      },
      select: { id: true },
    });
  });

  it("should throw if no clerkId is passed", async () => {
    await expect(resolveUser("")).rejects.toThrow("Clerk ID is required");
  });
});
