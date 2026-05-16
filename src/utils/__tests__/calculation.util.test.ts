// src/utils/__tests__/calculation.util.test.ts
import { describe, it, expect } from "vitest";
import { 
  calculatePortfolioMetrics, 
  calculateAllocationPercentage 
} from "../calculation.util.js";

describe("Calculation Utility", () => {
  
  describe("calculatePortfolioMetrics", () => {
    it("should calculate correct metrics for a profitable portfolio", () => {
      const holdings = [
        { ticker: "BBCA", total_shares: 10, avg_buy_price: 8000 } // Total Cost: 80,000
      ];
      const investedBalance = 80000;
      const cashBalance = 20000;
      const quotesMap = new Map([["BBCA", 10000]]); // Current Value: 100,000

      const result = calculatePortfolioMetrics(holdings, investedBalance, cashBalance, quotesMap);

      expect(result.total_value).toBe(100000);
      expect(result.profitAmount).toBe(20000);
      expect(result.profitPercentage).toBe(25);
      expect(result.allocations[0].ticker).toBe("BBCA");
      expect(result.allocations[0].percentage).toBe(100);
    });

    it("should calculate correct metrics for a losing portfolio", () => {
      const holdings = [
        { ticker: "GOTO", total_shares: 1000, avg_buy_price: 100 } // Total Cost: 100,000
      ];
      const investedBalance = 100000;
      const cashBalance = 0;
      const quotesMap = new Map([["GOTO", 50]]); // Current Value: 50,000

      const result = calculatePortfolioMetrics(holdings, investedBalance, cashBalance, quotesMap);

      expect(result.total_value).toBe(100000);
      expect(result.profitAmount).toBe(-50000);
      expect(result.profitPercentage).toBe(-50);
    });

    it("should handle zero invested balance gracefully", () => {
      const result = calculatePortfolioMetrics([], 0, 50000, new Map());
      
      expect(result.total_value).toBe(50000);
      expect(result.profitAmount).toBe(0);
      expect(result.profitPercentage).toBe(0);
    });
  });

  describe("calculateAllocationPercentage", () => {
    it("should return correct percentage string", () => {
      expect(calculateAllocationPercentage(50000, 100000)).toBe("50.0%");
      expect(calculateAllocationPercentage(1, 3)).toBe("33.3%");
    });

    it("should return 0% if total assets is zero", () => {
      expect(calculateAllocationPercentage(50000, 0)).toBe("0%");
    });
  });

});
