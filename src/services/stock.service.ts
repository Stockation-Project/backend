import {
  getAllStocks,
  getStockDetailFromDB,
  getUserRiskProfile,
  getStocksByRiskLevel,
} from "../models/stock.model.js";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey", "ripHistorical"],
});

export const fetchAllStocksService = async () => {
  const stocks = await getAllStocks();

  if (!stocks || stocks.length === 0) {
    throw new Error("Data saham tidak ditemukan atau masih kosong.");
  }

  return stocks;
};

// ini buat yahoo finance
export const fetchStockDetailService = async (ticker: string) => {
  // ini buat pastiin penulisan ticker huruf besar semua
  const cleanTicker = ticker.toUpperCase().replace(".JK", "");
  const yahooTicker = `${cleanTicker}.JK`;

  //ambil data dari supabase
  const dbStock: any = await getStockDetailFromDB(cleanTicker);

  //ambil Harga Saat Ini dari Yahoo Finance
  const quote: any = await yahooFinance.quote(yahooTicker);

  // ambil data grafik 1 bulan terakhir
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  const period1 = oneMonthAgo.toISOString().split("T")[0];
  const period2 = today.toISOString().split("T")[0];

  const chartResult: any = await yahooFinance.chart(yahooTicker, {
    period1: period1,
    period2: period2,
    interval: "1d" as "1d",
  });

  // format data grafik buat forntend
  const chartData = chartResult.quotes.map((item: any) => ({
    date: item.date,
    price: item.close,
  }));

  return {
    ticker: cleanTicker,
    name: dbStock ? dbStock.name : quote.longName,
    risk_level: dbStock ? dbStock.risk_level : "Unknown",
    is_anomaly: dbStock ? dbStock.is_anomaly : false,
    current_price: quote.regularMarketPrice,
    per: quote.trailingPE || null,
    day_high: quote.regularMarketDayHigh,
    day_low: quote.regularMarketDayLow,
    chart_1M: chartData,
  };
};

// ini buat halaman explore
export const fetchExploreStocksService = async () => {
  // ambil saham dari database
  const dbStocks = await getAllStocks();
  if (!dbStocks || dbStocks.length === 0) {
    return { gainers: [], losers: [], all_stocks: [] };
  }

  const mergedDataPromises = dbStocks.map(async (dbStock: any) => {
    // Bersihkan spasi berlebih pada ticker untuk berjaga-jaga
    const cleanTicker = dbStock.ticker.trim();
    const yahooTicker = `${cleanTicker}.JK`;

    try {
      // Tembak Yahoo Finance per saham secara bersamaan
      const quote: any = await yahooFinance.quote(yahooTicker);

      return {
        ticker: cleanTicker,
        name: dbStock.name,
        risk_level: dbStock.risk_level,
        is_anomaly: dbStock.is_anomaly,
        current_price: quote?.regularMarketPrice || 0,
        change_percent: quote?.regularMarketChangePercent || 0,
      };
    } catch (error) {
      // Jika 1 saham sedang error dari sananya, jangan gagalkan sistem. Kembalikan 0.
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

  // Tunggu semua tembakan API selesai
  const mergedData = await Promise.all(mergedDataPromises);

  // filter buat saham paling cuan
  const gainers = [...mergedData]
    .filter((s) => s.change_percent > 0)
    .sort((a, b) => b.change_percent - a.change_percent)
    .slice(0, 5);

  // filter buat paling rugi
  const losers = [...mergedData]
    .filter((s) => s.change_percent < 0)
    .sort((a, b) => a.change_percent - b.change_percent)
    .slice(0, 5);

  return {
    gainers,
    losers,
    all_stocks: mergedData,
  };
};

export const fetchRecommendedStocksService = async (userId: string) => {
  const userPersona = await getUserRiskProfile(userId);
  const personaLokal = userPersona.toLowerCase();

  const riskMapping: Record<string, string> = {
    lion: "High",
    eagle: "High", 
    wolf: "Medium",
    bear: "Medium",
    hippo: "Low",
    turtle: "Low",
  };

  // Ambil terjemahannya. Jika hewan tidak ditemukan di kamus, amankan ke 'Low'
  const targetRiskLevel = riskMapping[personaLokal] || "Low";

  // 3. Cari saham di database menggunakan hasil terjemahan ("High", "Medium", dll)
  const recommendedDbStocks = await getStocksByRiskLevel(targetRiskLevel);

  // 3. Tarik harga real-time secara paralel (Sama seperti halaman Explore)
  const recommendationsPromises = recommendedDbStocks.map(
    async (dbStock: any) => {
      const cleanTicker = dbStock.ticker.trim();
      const yahooTicker = `${cleanTicker}.JK`;

      try {
        const quote: any = await yahooFinance.quote(yahooTicker);

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
    },
  );

  const recommendations = await Promise.all(recommendationsPromises);

  return {
    user_risk_profile: userPersona, // Tampilkan aslinya ("lion") untuk keperluan UI
    mapped_risk_level: targetRiskLevel, // Tampilkan hasil konversinya ("High")
    recommendations: recommendations,
  };
};;
