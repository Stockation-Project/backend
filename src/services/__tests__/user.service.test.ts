// src/services/__tests__/user.service.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDashboardSummaryService } from "../user.service.js";
import supabase from "../../config/supabase.js";
import * as stockService from "../stock.service.js";

// Mocking dependencies
vi.mock("../../config/supabase.js", () => ({
  default: {
    from: vi.fn()
  }
}));

// Mock fetchRecommendedStocksService to avoid complex stock logic
vi.mock("../stock.service.js", () => ({
  fetchRecommendedStocksService: vi.fn()
}));

describe("User Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDashboardSummaryService", () => {
    it("should return a complete dashboard summary with correct calculations", async () => {
      const userId = "test-user-id";

      // Mock Supabase Chain for each call
      const mockUser = { first_name: "Mario", risk_profile: "wolf", risk_score: 30 };
      const mockWallet = { balance: 1000000 };
      const mockPortfolios = [
        { 
          id: "p1", name: "Saham Bluechip", cash_balance: 200000, invested_balance: 800000,
          portfolio_holdings: [{ ticker: "BBCA", total_shares: 10, avg_buy_price: 8000 }]
        }
      ];

      // Setup sequential mocks for supabase.from(...).select(...).eq(...).single() etc.
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "users") {
          return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: mockUser, error: null }) }) }) };
        }
        if (table === "wallets") {
          return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: mockWallet, error: null }) }) }) };
        }
        if (table === "portfolios") {
          return { select: () => ({ eq: () => Promise.resolve({ data: mockPortfolios, error: null }) }) };
        }
        return {};
      });

      // Mock Recommendation Service
      (stockService.fetchRecommendedStocksService as any).mockResolvedValue({
        user_risk_profile: "wolf",
        mapped_risk_level: "High",
        recommendations: []
      });

      // Execute
      const result = await getDashboardSummaryService(userId);

      // Verify
      expect(result.user_info.greeting).toBe("Haloo, Mario");
      expect(result.wallet_summary.main_wallet_balance).toBe(1000000);
      expect(result.wallet_summary.total_allocated_to_portfolio).toBe(1000000); // 200k + 800k
      expect(result.wallet_summary.total_assets).toBe(2000000); // 1M + 1M
      expect(result.wallet_summary.allocation_percentage).toBe("50.0%");
    });

    it("should throw error if user is not found", async () => {
      (supabase.from as any).mockImplementation(() => ({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: "User not found" } }) }) })
      }));

      await expect(getDashboardSummaryService("invalid-id")).rejects.toThrow("Gagal mengambil data user.");
    });
  });
});
