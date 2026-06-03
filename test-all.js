import { getStocksByRiskLevel } from "./src/models/stock.model.js";
import { enrichWithRealtimeQuotes } from "./src/adapters/yahoo.adapter.js";
import yahooFinance from "./src/config/yahoo-finance.js";

async function testAll() {
  const levels = ["Low", "Medium", "High"];
  for (const level of levels) {
    console.log(`\nTesting ${level} Risk Stocks:`);
    try {
      const stocks = await getStocksByRiskLevel(level);
      console.log(`Tickers:`, stocks.map(s => s.ticker));
      const enriched = await enrichWithRealtimeQuotes(stocks);
      console.log(`Prices:`, enriched.map(s => s.current_price));
      
      // Let's also test individual quotes to find the culprit
      for (const s of stocks) {
        try {
          await yahooFinance.quote(`${s.ticker.trim()}.JK`);
        } catch (e) {
          console.error(`ERROR ON INDIVIDUAL TICKER ${s.ticker}:`, e.message);
        }
      }
    } catch (e) {
      console.error(`Error on ${level}:`, e.message);
    }
  }
}

testAll();
