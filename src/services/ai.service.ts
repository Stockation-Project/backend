// src/services/ai.service.ts
import supabase from "../config/supabase.js";
import aiClient from "../config/ai-client.js";
import { redisClient } from "../utils/redis.util.js";

/**
 * Sinkronisasi tingkat risiko saham berdasarkan clustering ML
 */
export const syncClusteringRiskService = async () => {
  try {
    console.log("Memulai sinkronisasi clustering dari ML Service (Mungkin butuh waktu 1-2 menit)...");
    
    // 1. Panggil API ML untuk mendapatkan mapping terbaru
    const mlResponse = await aiClient.get("/api/ai/clustering");
    
    if (!mlResponse.data || !mlResponse.data.success) {
      throw new Error("Gagal mendapatkan data clustering dari ML Service");
    }

    const mapping = mlResponse.data.data; // { "BBCA": "Low", "GOTO": "High", ... }
    const tickers = Object.keys(mapping);

    const results = { success: 0, failed: 0, updated: [] as string[] };

    // 2. Update satu per satu ke database Supabase
    for (const ticker of tickers) {
      const riskLevel = mapping[ticker];
      const cleanTicker = ticker.replace(".JK", "");
      
      const { error } = await supabase
        .from("stocks")
        .update({ risk_level: riskLevel })
        .eq("ticker", cleanTicker);

      if (error) {
        results.failed++;
        console.error(`Gagal update ticker ${ticker}:`, error.message);
      } else {
        results.success++;
        results.updated.push(ticker);
      }
    }

    // 3. Invalidate Cache agar user langsung melihat perubahan
    console.log("Mengosongkan seluruh cache Redis...");
    await redisClient.flushAll();

    return results;
  } catch (error: any) {
    console.error("Error in syncClusteringRiskService:", error.message);
    throw error;
  }
};
