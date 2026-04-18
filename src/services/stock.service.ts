import { getAllStocks, getStockDetailFromDB } from "../models/stock.model.js";
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
