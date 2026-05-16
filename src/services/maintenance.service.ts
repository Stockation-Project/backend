// src/services/maintenance.service.ts
import supabase from "../config/supabase.js";
import yahooFinance from "../config/yahoo-finance.js";
import { IDX80_STOCKS } from "../constants/idx80.js";

/**
 * Seeding data awal 80 saham IDX80 ke database
 */
export const seedIdx80Service = async () => {
  const formattedData = IDX80_STOCKS.map((stock) => ({
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

  // Langsung jalankan sinkronisasi metadata agar data tidak kosong
  const syncReport = await syncStocksMetadataService();
  
  return { 
    inserted_count: IDX80_STOCKS.length, 
    sync_report: syncReport 
  };
};

/**
 * Sinkronisasi metadata saham (sektor, deskripsi) dari Yahoo Finance
 */
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
