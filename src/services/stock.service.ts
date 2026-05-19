import {
  getAllStocks,
  getStockDetailFromDB,
  getUserRiskProfile,
  getStocksByRiskLevel,
} from "../models/stock.model.js";
import yahooFinance from "../config/yahoo-finance.js";
import aiClient from "../config/ai-client.js";
import supabase from "../config/supabase.js";
import { IDX80_STOCKS } from "../constants/idx80.js";
import { USER_TO_ML_RISK_MAPPING } from "../constants/risk.js";
import {
  enrichWithRealtimeQuotes,
  calculateCAGR3Y,
  fetchAndMapAIAnomalies,
} from "../utils/stock.utils.js";
import { getSmartTTL, getCache, setCache, redisClient } from "../utils/redis.util.js";

export const fetchAllStocksService = async () => {
  const cacheKey = "stocks:all";
  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    console.log(`Cache Hit: [${cacheKey}]`);
    return cachedData;
  }

  const stocks = await getAllStocks();
  if (!stocks || stocks.length === 0)
    throw new Error("Data saham tidak ditemukan atau masih kosong.");
    
  await setCache(cacheKey, getSmartTTL(), stocks);
  return stocks;
};

export const fetchStockDetailService = async (ticker: string) => {
  const cleanTicker = ticker.toUpperCase().replace(".JK", "");
  
  const cacheKey = `stock:detail:${cleanTicker}`;
  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    console.log(`Cache Hit: [${cacheKey}]`);
    return cachedData;
  }

  const yahooTicker = `${cleanTicker}.JK`;

  const dbStock: any = await getStockDetailFromDB(cleanTicker);
  const quote: any = await yahooFinance.quote(yahooTicker);
  const companyName = dbStock ? dbStock.name : quote.longName;

  // 1. Ambil Data Fundamental
  let der = null;
  let dividend = null;
  try {
    const summary: any = await yahooFinance.quoteSummary(yahooTicker, {
      modules: ["financialData", "summaryDetail"],
    });
    der = summary?.financialData?.debtToEquity || null;
    dividend =
      summary?.summaryDetail?.dividendYield ||
      quote?.trailingAnnualDividendYield ||
      null;
  } catch (error) {
    console.log(`Gagal mengambil data fundamental untuk ${ticker}`);
  }

  // 2. Kalkulasi CAGR (Panggil dari Util)
  const cagr3Y = await calculateCAGR3Y(yahooTicker, quote.regularMarketPrice);

  // 3. Ambil Data Grafik 1 Tahun
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 1);

  const chartResult: any = await yahooFinance.chart(yahooTicker, {
    period1: startDate.toISOString().split("T")[0],
    period2: endDate.toISOString().split("T")[0],
    interval: "1d",
  });
  const chartData = chartResult.quotes.map((item: any) => ({
    date: item.date,
    price: item.close,
  }));

  // 4. Ambil Data AI Anomali (Panggil dari Util)
  const { anomalyHistory, aiSummary, isAnomalyActive } =
    await fetchAndMapAIAnomalies(cleanTicker, companyName);

  // 5. Return JSON Rapi
  const result = {
    ticker: cleanTicker,
    name: companyName,
    risk_level: dbStock ? dbStock.risk_level : "Unknown",
    is_anomaly: isAnomalyActive,
    current_price: quote.regularMarketPrice,
    per: quote.trailingPE || null,
    der,
    dividend,
    cagr: cagr3Y,
    day_high: quote.regularMarketDayHigh,
    day_low: quote.regularMarketDayLow,
    chart_data: chartData,
    anomaly_history: anomalyHistory,
    ai_summary: aiSummary,
    sector: dbStock?.sector || "Lainnya",
    about_company:
      dbStock?.description || "Deskripsi perusahaan belum tersedia.",
  };

  await setCache(cacheKey, getSmartTTL(), result);
  return result;
};

export const fetchExploreStocksService = async () => {
  const cacheKey = "stocks:explore";
  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    console.log(`Cache Hit: [${cacheKey}]`);
    return cachedData;
  }

  const dbStocks = await getAllStocks();
  if (!dbStocks || dbStocks.length === 0)
    return { gainers: [], losers: [], all_stocks: [] };

  // Panggil dari Util
  const mergedData = await enrichWithRealtimeQuotes(dbStocks);

  const gainers = [...mergedData]
    .filter((s) => s.change_percent > 0)
    .sort((a, b) => b.change_percent - a.change_percent)
    .slice(0, 5);
  const losers = [...mergedData]
    .filter((s) => s.change_percent < 0)
    .sort((a, b) => a.change_percent - b.change_percent)
    .slice(0, 5);

  const result = { gainers, losers, all_stocks: mergedData };
  await setCache(cacheKey, getSmartTTL(), result);
  return result;
};

export const fetchRecommendedStocksService = async (userId: string) => {
  const cacheKey = `stocks:recommendations:${userId}`;
  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    console.log(`Cache Hit: [${cacheKey}]`);
    return cachedData;
  }

  const userPersona = await getUserRiskProfile(userId);
  
  const targetRiskLevel = USER_TO_ML_RISK_MAPPING[userPersona.toLowerCase()] || "Medium";

  const recommendedDbStocks = await getStocksByRiskLevel(targetRiskLevel);

  // Jika data masih kosong (mungkin belum di-sync), ambil 5 saham random sebagai fallback aman
  let finalStocks = recommendedDbStocks;
  if (!finalStocks || finalStocks.length === 0) {
    console.log(`Risk level ${targetRiskLevel} empty in DB. Using fallback random stocks.`);
    const allStocks = await getAllStocks();
    finalStocks = allStocks.slice(0, 5);
  }

  // Panggil dari Util
  const recommendations = await enrichWithRealtimeQuotes(finalStocks);

  const result = {
    user_risk_profile: userPersona,
    mapped_risk_level: targetRiskLevel,
    recommendations,
  };

  await setCache(cacheKey, getSmartTTL(), result);
  return result;
};
