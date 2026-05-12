import YahooFinance from "yahoo-finance2";
import axios from "axios";
import supabase from "../config/supabase.js";

// --- KONFIGURASI GLOBAL ---
const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";
const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey", "ripHistorical"],
});

export const enrichWithRealtimeQuotes = async (dbStocks: any[]) => {
  const promises = dbStocks.map(async (dbStock) => {
    const cleanTicker = dbStock.ticker.trim();
    try {
      const quote: any = await yahooFinance.quote(`${cleanTicker}.JK`);
      return {
        ticker: cleanTicker,
        name: dbStock.name,
        risk_level: dbStock.risk_level,
        is_anomaly: dbStock.is_anomaly,
        current_price: quote?.regularMarketPrice || 0,
        change_percent: quote?.regularMarketChangePercent || 0,
      };
    } catch (error) {
      return {
        ticker: cleanTicker,
        name: dbStock.name,
        risk_level: dbStock.risk_level,
        is_anomaly: dbStock.is_anomaly,
        current_price: 0,
        change_percent: 0,
      };
    }
  });
  return Promise.all(promises);
};

export const calculateCAGR3Y = async (
  yahooTicker: string,
  currentPrice: number,
) => {
  try {
    const today = new Date();
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(today.getFullYear() - 3);

    const period1 = threeYearsAgo.toISOString().split("T")[0];
    const period2 = new Date(threeYearsAgo.getTime() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const historical3Y: any = await yahooFinance.historical(yahooTicker, {
      period1,
      period2,
      interval: "1d",
    });

    if (historical3Y && historical3Y.length > 0) {
      const beginningPrice = historical3Y[0].close;
      return Math.pow(currentPrice / beginningPrice, 1 / 3) - 1;
    }
  } catch (error) {
    console.log(`Gagal menghitung CAGR untuk ${yahooTicker}`);
  }
  return null;
};

export const fetchAndMapAIAnomalies = async (
  cleanTicker: string,
  companyName: string,
) => {
  let anomalyHistory = [];
  let aiSummary = "Data analisis AI belum tersedia.";
  let isAnomalyActive = false;

  try {
    const aiResponse = await axios.get(
      `${FASTAPI_URL}/api/ai/anomalies/${cleanTicker}`,
    );

    if (aiResponse.data && aiResponse.data.success) {
      const rawAnomalies = aiResponse.data.anomalies;

      if (rawAnomalies.length > 0) {
        const todayStr = new Date().toISOString().split("T")[0];
        isAnomalyActive = rawAnomalies.some(
          (anomaly: any) => anomaly.date === todayStr,
        );
        supabase
          .from("stocks")
          .update({ is_anomaly: isAnomalyActive })
          .eq("ticker", cleanTicker)
          .then();
      }

      const statusMap: Record<string, string> = {
        critical: "Kritis",
        high: "Tinggi",
        medium: "Sedang",
        low: "Rendah",
      };
      const translateType: Record<string, string> = {
        volume_spike: "Lonjakan Volume",
        return_anomaly: "Return Ekstrem",
        price_spike: "Lonjakan Harga",
        gap_up: "Gap Up",
        gap_down: "Gap Down",
      };

      anomalyHistory = rawAnomalies.map((item: any, index: number) => {
        let movement = `Nilai: ${item.value}`;
        if (item.anomaly_type === "volume_spike")
          movement = `Vol: ${item.value.toLocaleString("id-ID")} lot`;
        else if (
          item.anomaly_type.includes("return") ||
          item.anomaly_type.includes("gap")
        )
          movement = `Ret: ${(item.value * 100).toFixed(2)}%`;

        return {
          id: String(index + 1),
          period: item.date,
          price_movement: movement,
          status: `${statusMap[item.severity] || item.severity} (${translateType[item.anomaly_type] || item.anomaly_type})`,
        };
      });

      const criticalCount = rawAnomalies.filter(
        (a: any) => a.severity === "critical",
      ).length;
      aiSummary =
        rawAnomalies.length > 0
          ? `${companyName} terpantau memiliki ${rawAnomalies.length} anomali dalam 1 tahun terakhir, termasuk ${criticalCount} anomali level kritis. Sistem AI merekomendasikan untuk memperhatikan manajemen risiko akibat pergerakan volume dan harga yang fluktuatif ini.`
          : `${companyName} menunjukkan pergerakan yang wajar dan stabil tanpa anomali ekstrem dalam 1 tahun terakhir. Saham ini cenderung aman dari volatilitas mendadak.`;
    }
  } catch (error) {
    console.log(`Gagal menghubungi AI Service untuk ${cleanTicker}.`);
  }

  return { anomalyHistory, aiSummary, isAnomalyActive };
};
