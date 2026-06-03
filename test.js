import { getStocksByRiskLevel } from "./src/models/stock.model.js";
import { fetchRecommendedStocksService, fetchExploreStocksService } from "./src/services/stock.service.js";
import { enrichWithRealtimeQuotes } from "./src/adapters/yahoo.adapter.js";

async function test() {
  console.log("Testing High Risk Stocks:");
  try {
    const highRisk = await getStocksByRiskLevel("High");
    console.log("High Risk DB length:", highRisk.length);
    console.log("High Risk Tickers:", highRisk.map(s => s.ticker));
    
    console.log("Enriching High Risk...");
    const enriched = await enrichWithRealtimeQuotes(highRisk);
    console.log("Enriched High Risk Prices:", enriched.map(s => s.current_price));
  } catch (e) {
    console.error("Error High:", e.message);
  }
}

test();
