import {
  getAllStocks,
  getStockDetailFromDB,
  getUserRiskProfile,
  getStocksByRiskLevel,
} from "../models/stock.model.js";
import YahooFinance from "yahoo-finance2";
import supabase from "../config/supabase.js";

// Impor fungsi pembantu dari folder utils
import {
  enrichWithRealtimeQuotes,
  calculateCAGR3Y,
  fetchAndMapAIAnomalies,
} from "../utils/stock.utils.js";
import { getSmartTTL, getCache, setCache } from "../utils/redis.util.js";

// Konfigurasi instance yahooFinance untuk keperluan di dalam service ini
const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey", "ripHistorical"],
});

export const fetchAllStocksService = async () => {
  const cacheKey = "stocks:all";
  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    console.log(`🚀 Cache Hit: [${cacheKey}]`);
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
    console.log(`🚀 Cache Hit: [${cacheKey}]`);
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
    console.log(`🚀 Cache Hit: [${cacheKey}]`);
    return cachedData;
  }

  const userPersona = await getUserRiskProfile(userId);
  const riskMapping: Record<string, string> = {
    lion: "High",
    eagle: "High",
    wolf: "Medium",
    bear: "Medium",
    hippo: "Low",
    turtle: "Low",
  };
  const targetRiskLevel = riskMapping[userPersona.toLowerCase()] || "Low";

  const recommendedDbStocks = await getStocksByRiskLevel(targetRiskLevel);

  // Panggil dari Util
  const recommendations = await enrichWithRealtimeQuotes(recommendedDbStocks);

  const result = {
    user_risk_profile: userPersona,
    mapped_risk_level: targetRiskLevel,
    recommendations,
  };

  await setCache(cacheKey, getSmartTTL(), result);
  return result;
};

export const syncStocksMetadataService = async () => {
  const { data: stocks, error } = await supabase
    .from("stocks")
    .select("ticker");
  if (error || !stocks)
    throw new Error("Gagal mengambil daftar ticker dari DB");

  const results = { success: 0, failed: 0, details: [] as string[] };

  for (const stock of stocks) {
    try {
      const summary: any = await yahooFinance.quoteSummary(
        `${stock.ticker}.JK`,
        { modules: ["assetProfile"] },
      );
      await supabase
        .from("stocks")
        .update({
          sector: summary.assetProfile?.sector || "Lainnya",
          description:
            summary.assetProfile?.longBusinessSummary ||
            "Deskripsi tidak tersedia.",
        })
        .eq("ticker", stock.ticker);

      results.success++;
    } catch (err) {
      results.failed++;
      results.details.push(stock.ticker);
    }
  }
  return results;
};

export const seedIdx80Service = async () => {
  // Masukkan kembali array lengkap 80 sahammu di sini
  const idx80Tickers = [
    { ticker: "BBCA", name: "Bank Central Asia Tbk." },
    { ticker: "BBRI", name: "Bank Rakyat Indonesia (Persero) Tbk." },
    { ticker: "BMRI", name: "Bank Mandiri (Persero) Tbk." },
    { ticker: "BBNI", name: "Bank Negara Indonesia (Persero) Tbk." },
    { ticker: "TLKM", name: "Telkom Indonesia (Persero) Tbk." },
    { ticker: "ASII", name: "Astra International Tbk." },
    { ticker: "AMMN", name: "Amman Mineral Internasional Tbk." },
    { ticker: "BREN", name: "Barito Renewables Energy Tbk." },
    { ticker: "UNTR", name: "United Tractors Tbk." },
    { ticker: "ICBP", name: "Indofood CBP Sukses Makmur Tbk." },
    { ticker: "INDF", name: "Indofood Sukses Makmur Tbk." },
    { ticker: "KLBF", name: "Kalbe Farma Tbk." },
    { ticker: "AMRT", name: "Sumber Alfaria Trijaya Tbk." },
    { ticker: "GOTO", name: "GoTo Gojek Tokopedia Tbk." },
    { ticker: "ADRO", name: "Adaro Energy Indonesia Tbk." },
    { ticker: "PTBA", name: "Bukit Asam Tbk." },
    { ticker: "ITMG", name: "Indo Tambangraya Megah Tbk." },
    { ticker: "PGAS", name: "Perusahaan Gas Negara Tbk." },
    { ticker: "UNVR", name: "Unilever Indonesia Tbk." },
    { ticker: "CPIN", name: "Charoen Pokphand Indonesia Tbk." },
    { ticker: "MYOR", name: "Mayora Indah Tbk." },
    { ticker: "TPIA", name: "Chandra Asri Pacific Tbk." },
    { ticker: "INKP", name: "Indah Kiat Pulp & Paper Tbk." },
    { ticker: "BRPT", name: "Barito Pacific Tbk." },
    { ticker: "MDKA", name: "Merdeka Copper Gold Tbk." },
    { ticker: "INCO", name: "Vale Indonesia Tbk." },
    { ticker: "ANTM", name: "Aneka Tambang Tbk." },
    { ticker: "MEDC", name: "Medco Energi Internasional Tbk." },
    { ticker: "ARTO", name: "Bank Jago Tbk." },
    { ticker: "EXCL", name: "XL Axiata Tbk." },
    { ticker: "ISAT", name: "Indosat Tbk." },
    { ticker: "TOWR", name: "Sarana Menara Nusantara Tbk." },
    { ticker: "TBIG", name: "Tower Bersama Infrastructure Tbk." },
    { ticker: "JPFA", name: "Japfa Comfeed Indonesia Tbk." },
    { ticker: "SMGR", name: "Semen Indonesia (Persero) Tbk." },
    { ticker: "INTP", name: "Indocement Tunggal Prakarsa Tbk." },
    { ticker: "BFIN", name: "BFI Finance Indonesia Tbk." },
    { ticker: "BRIS", name: "Bank Syariah Indonesia Tbk." },
    { ticker: "MEGA", name: "Bank Mega Tbk." },
    { ticker: "BBTN", name: "Bank Tabungan Negara (Persero) Tbk." },
    { ticker: "NISP", name: "Bank OCBC NISP Tbk." },
    { ticker: "BDMN", name: "Bank Danamon Indonesia Tbk." },
    { ticker: "AKRA", name: "AKR Corporindo Tbk." },
    { ticker: "ERAA", name: "Erajaya Swasembada Tbk." },
    { ticker: "MAPI", name: "Mitra Adiperkasa Tbk." },
    { ticker: "SIDO", name: "Industri Jamu dan Farmasi Sido Muncul Tbk." },
    { ticker: "ACES", name: "Aspirasi Hidup Indonesia Tbk." },
    { ticker: "SCMA", name: "Surya Citra Media Tbk." },
    { ticker: "BSDE", name: "Bumi Serpong Damai Tbk." },
    { ticker: "CTRA", name: "Ciputra Development Tbk." },
    { ticker: "PWON", name: "Pakuwon Jati Tbk." },
    { ticker: "SMRA", name: "Summarecon Agung Tbk." },
    { ticker: "AALI", name: "Astra Agro Lestari Tbk." },
    { ticker: "LSIP", name: "PP London Sumatra Indonesia Tbk." },
    { ticker: "TAPG", name: "Triputra Agro Persada Tbk." },
    { ticker: "DSNG", name: "Dharma Satya Nusantara Tbk." },
    { ticker: "EMTK", name: "Elang Mahkota Teknologi Tbk." },
    { ticker: "ESSA", name: "ESSA Industries Indonesia Tbk." },
    { ticker: "SILO", name: "Siloam International Hospitals Tbk." },
    { ticker: "MIKA", name: "Mitra Keluarga Karyasehat Tbk." },
    { ticker: "HEAL", name: "Medikaloka Hermina Tbk." },
    { ticker: "PRDA", name: "Prodia Widyahusada Tbk." },
    { ticker: "BUKA", name: "Bukalapak.com Tbk." },
    { ticker: "GGRM", name: "Gudang Garam Tbk." },
    { ticker: "MTEL", name: "Dayamitra Telekomunikasi Tbk." },
    { ticker: "RAJA", name: "Rukun Raharja Tbk." },
    { ticker: "ENRG", name: "Energi Mega Persada Tbk." },
    { ticker: "ADMR", name: "Adaro Minerals Indonesia Tbk." },
    { ticker: "INDY", name: "Indika Energy Tbk." },
    { ticker: "HRUM", name: "Harum Energy Tbk." },
    { ticker: "CUAN", name: "Petrindo Semesta Kreasi Tbk." },
    { ticker: "WIKA", name: "Wijaya Karya (Persero) Tbk." },
    { ticker: "PTPP", name: "PP (Persero) Tbk." },
    { ticker: "ADHI", name: "Adhi Karya (Persero) Tbk." },
    { ticker: "WSKT", name: "Waskita Karya (Persero) Tbk." },
    { ticker: "WTON", name: "Wijaya Karya Beton Tbk." },
    { ticker: "SRTG", name: "Saratoga Investama Sedaya Tbk." },
    { ticker: "BTPS", name: "Bank BTPN Syariah Tbk." },
    { ticker: "PNBN", name: "Bank Pan Indonesia Tbk." },
    { ticker: "AVIA", name: "Avia Avian Tbk." },
  ];

  const formattedData = idx80Tickers.map((stock) => ({
    ticker: stock.ticker,
    name: stock.name,
    risk_level: "Medium",
    is_anomaly: false,
    sector: "Menunggu Sinkronisasi...",
    description: "Menunggu Sinkronisasi...",
  }));

  const { error } = await supabase
    .from("stocks")
    .upsert(formattedData, { onConflict: "ticker" });
  if (error) throw new Error(`Gagal melakukan seed data: ${error.message}`);

  const syncReport = await syncStocksMetadataService();
  return { inserted_count: idx80Tickers.length, sync_report: syncReport };
};
