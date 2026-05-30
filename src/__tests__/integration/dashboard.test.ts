// src/__tests__/integration/dashboard.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../index.js";
import supabase from "../../config/supabase.js";

// Mock Supabase
vi.mock("../../config/supabase.js", () => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));
  
  return {
    default: {
      auth: {
        getUser: vi.fn()
      },
      from: mockFrom
    }
  };
});

vi.mock("../../utils/stock.utils.js", () => ({
  enrichWithRealtimeQuotes: vi.fn((stocks) => Promise.resolve(stocks)),
  calculateCAGR3Y: vi.fn(() => 0)
}));

vi.mock("../../utils/redis.util.js", () => ({
  getCache: vi.fn(),
  setCache: vi.fn(),
  getSmartTTL: vi.fn(),
  redisClient: {
    flushAll: vi.fn()
  }
}));

describe("Integration: Dashboard Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if no token is provided", async () => {
    const response = await request(app).get("/api/users/dashboard");
    
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Tiket tidak ditemukan");
  });

  it("should return 200 and dashboard data if token is valid", async () => {
    // 1. Mock Auth Success
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: "user-123", email: "test@gmail.com" } },
      error: null
    });

    // 2. Mock Database Responses (Robust Mock)
    const mockDbResponse = (data: any) => ({
      data,
      error: null,
      select: () => mockDbResponse(data),
      eq: () => mockDbResponse(data),
      order: () => mockDbResponse(data),
      limit: () => mockDbResponse(data),
      single: () => Promise.resolve({ data, error: null }),
      maybeSingle: () => Promise.resolve({ data, error: null }),
      then: (cb: any) => Promise.resolve(cb({ data, error: null }))
    });

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === "users") return mockDbResponse({ first_name: "Mario", risk_profile: "wolf" });
      if (table === "wallets") return mockDbResponse({ balance: 1000000 });
      if (table === "portfolios") return mockDbResponse([]);
      if (table === "stocks") return mockDbResponse([]);
      return mockDbResponse(null);
    });

    // 3. Execute Request
    const response = await request(app)
      .get("/api/users/dashboard")
      .set("Authorization", "Bearer valid-token");

    // 4. Verify
    if (response.status !== 200) console.log("INTEGRATION ERROR:", response.body);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user_info.greeting).toBe("Haloo, Mario");
    expect(response.body.data.wallet_summary.main_wallet_balance).toBe(1000000);
  });
});
