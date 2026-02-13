import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";

// Mock the dependencies
vi.mock("./db", () => ({
  getDb: vi.fn(),
  getUserByEmail: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

vi.mock("./_core/sdk", () => ({
  createSessionToken: vi.fn(),
  verifySession: vi.fn(),
  authenticateRequest: vi.fn(),
}));

vi.mock("./_core/cookies", () => ({
  getSessionCookieOptions: vi.fn(() => ({
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
  })),
}));

function createAuthContext() {
  const clearedCookies: any[] = [];

  const user = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "local",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: any = {
    user,
    req: {
      protocol: "https",
      headers: {},
    },
    res: {
      clearCookie: (name: string, options: any) => {
        clearedCookies.push({ name, options });
      },
    },
  };

  return { ctx, clearedCookies };
}

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
      secure: true,
      sameSite: "lax",
      httpOnly: true,
      path: "/",
    });
  });
});
