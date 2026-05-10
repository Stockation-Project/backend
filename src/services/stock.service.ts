import {
  getAllStocks,
  getStockDetailFromDB,
  getUserRiskProfile,
  getStocksByRiskLevel,
} from "../models/stock.model.js";
import YahooFinance from "yahoo-finance2";
import axios from "axios";
import supabase from "../config/supabase.js";

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

// Tambahkan fungsi ini di services/stock.service.ts

export const seedIdx80Service = async () => {
  // Daftar 80+ Saham Populer / IDX80 (beserta nama default, akan diupdate oleh Yahoo nanti)
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
    { ticker: "AVIA", name: "Avia Avian Tbk." }
  ];

  // Siapkan format data untuk dimasukkan ke Supabase
  // Kita set default risk_level ke "Medium" dan is_anomaly ke "false"
  const formattedData = idx80Tickers.map(stock => ({
    ticker: stock.ticker,
    name: stock.name,
    risk_level: "Medium",
    is_anomaly: false,
    sector: "Menunggu Sinkronisasi...",
    description: "Menunggu Sinkronisasi..."
  }));

  // Masukkan ke database (Gunakan upsert agar jika saham sudah ada, tidak terjadi error duplikat)
  const { error } = await supabase
    .from("stocks")
    .upsert(formattedData, { onConflict: "ticker" });

  if (error) {
    throw new Error(`Gagal melakukan seed data: ${error.message}`);
  }

  // Setelah 80 saham berhasil masuk, kita otomatis jalankan fungsi sinkronisasi Yahoo Finance
  // agar sektor dan deskripsinya langsung terisi!
  const syncReport = await syncStocksMetadataService();

  return {
    inserted_count: idx80Tickers.length,
    sync_report: syncReport
  };
};

export const syncStocksMetadataService = async () => {
  // 1. Ambil semua ticker yang ada di database
  const { data: stocks, error } = await supabase
    .from("stocks")
    .select("ticker");

  if (error || !stocks)
    throw new Error("Gagal mengambil daftar ticker dari DB");

  const results = {
    success: 0,
    failed: 0,
    details: [] as string[],
  };

  // 2. Loop setiap saham dan ambil datanya dari Yahoo
  for (const stock of stocks) {
    try {
      const yahooTicker = `${stock.ticker}.JK`;

      // Ambil profil perusahaan
      const summary: any = await yahooFinance.quoteSummary(yahooTicker, {
        modules: ["assetProfile"],
      });

      const sector = summary.assetProfile?.sector || "Lainnya";
      const description =
        summary.assetProfile?.longBusinessSummary ||
        "Deskripsi tidak tersedia.";

      // 3. Update data ke Supabase
      const { error: updateError } = await supabase
        .from("stocks")
        .update({
          sector: sector,
          description: description,
        })
        .eq("ticker", stock.ticker);

      if (updateError) throw updateError;

      results.success++;
      console.log(`✅ Berhasil sinkronisasi: ${stock.ticker}`);
    } catch (err) {
      results.failed++;
      results.details.push(stock.ticker);
      console.error(`❌ Gagal sinkronisasi ${stock.ticker}:`, err);
    }
  }

  return results;
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

  // 3. Ambil Data Fundamental (DER & Dividen) menggunakan quoteSummary
  let der = null;
  let dividend = null;
  try {
    const summary: any = await yahooFinance.quoteSummary(yahooTicker, {
      modules: ["financialData", "summaryDetail"],
    });
    // DER biasanya dalam angka desimal (misal 25.5 berarti 25.5%)
    der = summary?.financialData?.debtToEquity || null;

    // Dividen Yield (misal 0.05 berarti 5%)
    dividend =
      summary?.summaryDetail?.dividendYield ||
      quote?.trailingAnnualDividendYield ||
      null;
  } catch (error) {
    console.log(`Gagal mengambil data fundamental untuk ${ticker}`);
  }

  // 4. Kalkulasi CAGR 3 Tahun
  let cagr3Y = null;
  try {
    const today = new Date();
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(today.getFullYear() - 3);

    // Ambil histori harga tepat 3 tahun yang lalu (beri rentang 7 hari agar pasti kena hari kerja bursa)
    const period1 = threeYearsAgo.toISOString().split("T")[0];
    const period2 = new Date(threeYearsAgo.getTime() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const historical3Y: any = await yahooFinance.historical(yahooTicker, {
      period1: period1,
      period2: period2,
      interval: "1d" as "1d",
    });

    if (historical3Y && historical3Y.length > 0) {
      const beginningPrice = historical3Y[0].close; // Vi
      const endingPrice = quote.regularMarketPrice; // Vf
      const t = 3; // 3 Tahun

      // Rumus CAGR
      cagr3Y = Math.pow(endingPrice / beginningPrice, 1 / t) - 1;
    }
  } catch (error) {
    console.log(`Gagal menghitung CAGR untuk ${ticker}`);
  }

  // 5. Ambil Data Grafik 1 Bulan Terakhir
  const todayDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(todayDate.getMonth() - 1);

  const chartResult: any = await yahooFinance.chart(yahooTicker, {
    period1: oneMonthAgo.toISOString().split("T")[0],
    period2: todayDate.toISOString().split("T")[0],
    interval: "1d" as "1d",
  });

  const chartData = chartResult.quotes.map((item: any) => ({
    date: item.date,
    price: item.close,
  }));

  // =================================================================
  // TAMBAHAN BARU: 5.5 Panggil API AI (FastAPI) untuk Data Anomali
  // =================================================================
  let anomalyHistory = [];
  let aiSummary = "Data analisis AI belum tersedia.";
  let isAnomalyActive = false; // <--- 1. Tambahkan variabel penampung status aktif di sini

  try {
    // Menembak endpoint FastAPI (Pastikan URL & Port sesuai)
    const aiResponse = await axios.get(
      `http://127.0.0.1:8000/api/ai/anomalies/${cleanTicker}`,
    );

    if (aiResponse.data && aiResponse.data.success) {
      const rawAnomalies = aiResponse.data.anomalies;

      // 2. Tentukan apakah ada anomali yang terjadi hari ini (atau terbaru)
      if (rawAnomalies.length > 0) {
        const todayStr = new Date().toISOString().split("T")[0];

        // Memeriksa jika ada tanggal anomali yang sama dengan hari ini
        isAnomalyActive = rawAnomalies.some(
          (anomaly: any) => anomaly.date === todayStr,
        );
      }

      // Terjemahkan format Python ke format UI Frontend kita
      anomalyHistory = rawAnomalies.map((item: any, index: number) => {
        // Tentukan teks pergerakan
        let movement = "";
        if (item.anomaly_type === "volume_spike") {
          movement = `Vol: ${item.value.toLocaleString("id-ID")} lot`;
        } else if (
          item.anomaly_type.includes("return") ||
          item.anomaly_type.includes("gap")
        ) {
          movement = `Ret: ${(item.value * 100).toFixed(2)}%`;
        } else {
          movement = `Nilai: ${item.value}`;
        }

        // Tentukan status bahasa Indonesia
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

        return {
          id: String(index + 1),
          period: item.date, // Tanggal (misal: "2026-05-04")
          price_movement: movement,
          status: `${statusMap[item.severity] || item.severity} (${translateType[item.anomaly_type] || item.anomaly_type})`,
        };
      });

      // Buat AI Summary dinamis berdasarkan hasil yang didapat
      if (rawAnomalies.length > 0) {
        const criticalCount = rawAnomalies.filter(
          (a: any) => a.severity === "critical",
        ).length;
        aiSummary = `${quote.longName || cleanTicker} terpantau memiliki ${rawAnomalies.length} anomali dalam 1 tahun terakhir, termasuk ${criticalCount} anomali level kritis. Sistem AI merekomendasikan untuk memperhatikan manajemen risiko akibat pergerakan volume dan harga yang fluktuatif ini.`;
      } else {
        aiSummary = `${quote.longName || cleanTicker} menunjukkan pergerakan yang wajar dan stabil tanpa anomali ekstrem dalam 1 tahun terakhir. Saham ini cenderung aman dari volatilitas mendadak.`;
      }
    }
  } catch (error) {
    console.log(
      `Gagal menghubungi AI Service untuk ${cleanTicker}. Pastikan FastAPI menyala.`,
    );
  }
  // =================================================================
  // =================================================================

  // 6. Jahit data menjadi satu JSON yang rapi
  return {
    ticker: cleanTicker,
    name: dbStock ? dbStock.name : quote.longName,
    risk_level: dbStock ? dbStock.risk_level : "Unknown",
    is_anomaly: isAnomalyActive,
    current_price: quote.regularMarketPrice,
    per: quote.trailingPE || null,
    der: der, // <-- Metrik Baru
    dividend: dividend, // <-- Metrik Baru
    cagr: cagr3Y, // <-- Metrik Baru
    day_high: quote.regularMarketDayHigh,
    day_low: quote.regularMarketDayLow,
    chart_1M: chartData,

    // SUNTIKKAN DATA BARU KE SINI
    anomaly_history: anomalyHistory,
    ai_summary: aiSummary,
    sector: dbStock?.sector || "Lainnya",
    about_company:
      dbStock?.description || "Deskripsi perusahaan belum tersedia.",
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
};
