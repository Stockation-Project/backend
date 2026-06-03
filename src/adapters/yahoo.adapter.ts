import yahooFinance from "../config/yahoo-finance.js";

export const enrichWithRealtimeQuotes = async (dbStocks: any[]) => {
  if (!dbStocks || dbStocks.length === 0) return [];

  try {
    const symbols = dbStocks.map((s) => `${s.ticker.trim()}.JK`);
    // Menggunakan bulk request (1 kali request untuk semua saham) 
    // Ini sangat krusial untuk mencegah pemblokiran IP oleh Yahoo Finance
    const quotes: any = await yahooFinance.quote(symbols);
    const quotesArray = Array.isArray(quotes) ? quotes : [quotes];
    
    return dbStocks.map((dbStock) => {
      const cleanTicker = dbStock.ticker.trim();
      const quote = quotesArray.find((q: any) => q.symbol === `${cleanTicker}.JK`);
      
      return {
        ticker: cleanTicker,
        name: dbStock.name,
        risk_level: dbStock.risk_level,
        is_anomaly: dbStock.is_anomaly,
        current_price: quote?.regularMarketPrice || 0,
        change_percent: quote?.regularMarketChangePercent || 0,
      };
    });
  } catch (error: any) {
    console.error("Gagal bulk fetch Yahoo Finance:", error.message);
    return dbStocks.map((dbStock) => ({
      ticker: dbStock.ticker.trim(),
      name: dbStock.name,
      risk_level: dbStock.risk_level,
      is_anomaly: dbStock.is_anomaly,
      current_price: 0,
      change_percent: 0,
    }));
  }
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
