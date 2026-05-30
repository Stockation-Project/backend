// src/services/__tests__/ai.service.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { syncClusteringRiskService } from "../ai.service.js";
import supabase from "../../config/supabase.js";
import aiClient from "../../config/ai-client.js";
import { redisClient } from "../../utils/redis.util.js";

// Mocking dependencies
vi.mock("../../config/supabase.js", () => ({
  default: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}));

vi.mock("../../config/ai-client.js", () => ({
  default: {
    get: vi.fn()
  }
}));

vi.mock("../../utils/redis.util.js", () => ({
  redisClient: {
    flushAll: vi.fn(() => Promise.resolve())
  }
}));

describe("AI Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should sync clustering risk correctly when ML service returns success", async () => {
    // 1. Mock ML Response
    const mockMapping = { "BBCA.JK": "Low", "GOTO.JK": "High" };
    (aiClient.get as any).mockResolvedValue({
      data: { success: true, data: mockMapping }
    });

    // 2. Execute
    const result = await syncClusteringRiskService();

    // 3. Verify
    expect(result.success).toBe(2);
    expect(result.updated).toContain("BBCA.JK");
    expect(result.updated).toContain("GOTO.JK");
    
    // Verify Supabase was called for each ticker
    expect(supabase.from).toHaveBeenCalledWith("stocks");
    
    // Verify Redis was flushed
    expect(redisClient.flushAll).toHaveBeenCalled();
  });

  it("should throw error if ML service returns failure", async () => {
    // 1. Mock ML Failure
    (aiClient.get as any).mockResolvedValue({
      data: { success: false }
    });

    // 2. Execute & Verify
    await expect(syncClusteringRiskService()).rejects.toThrow("Gagal mendapatkan data clustering dari ML Service");
  });

  it("should throw error if ML service call fails (network error)", async () => {
    // 1. Mock Network Error
    (aiClient.get as any).mockRejectedValue(new Error("Network Error"));

    // 2. Execute & Verify
    await expect(syncClusteringRiskService()).rejects.toThrow("Network Error");
  });
});
