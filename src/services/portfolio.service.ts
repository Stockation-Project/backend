import { createPortfolioInDb, getPortfolioWithHoldings } from "../models/portfolio.model.js";
import { deductWalletBalance, getWalletById } from "../models/wallet.model.js";
import aiClient from "../config/ai-client.js";
import { getUserProfileService } from "./user.service.js";
import { mapUserRiskToMLProfile } from "../utils/persona.util.js";

export interface CreatePortfolioPayload {
  name: string;
  allocated_fund: number;
}

export const createPortfolioService = async (
  userId: string,
  payload: CreatePortfolioPayload,
) => {
  const { name, allocated_fund } = payload;

  // gabisa input dana 0
  if (allocated_fund <= 0) {
    throw new Error("Alokasi dana harus lebih dari 0");
  }

  // cek isi saldo global wallet
  const wallet = await getWalletById(userId);

  // Tambahkan pengecekan ini:
  if (!wallet) {
    throw new Error(
      "Dompet Utama tidak ditemukan. Pastikan Anda sudah mengisi kuesioner untuk mendapatkan modal awal.",
    );
  }

  if (!wallet || wallet.balance < allocated_fund) {
    throw new Error("Saldo Dompet Utama tidak mencukupi, silakan Top Up");
  }

  // potong saldo global wallet
  await deductWalletBalance(wallet.id, wallet.balance, allocated_fund);

  // buar card porto baru
  const newPortfolio = await createPortfolioInDb(userId, name, allocated_fund);

  return {
    portfolio: newPortfolio,
    remaining_main_balance: wallet.balance - allocated_fund,
  };
};

export const fetchPortfolioDetailService = async (
  portfolioId: string,
  userId: string,
) => {
  const portfolio = await getPortfolioWithHoldings(portfolioId, userId);

  if (!portfolio) {
    throw new Error(
      "Portofolio tidak ditemukan atau Anda tidak memiliki akses.",
    );
  }

  return portfolio;
};

export const fetchAllUserPortfoliosService = async (userId: string) => {
  const { data, error } = await (await import("../config/supabase.js")).default
    .from("portfolios")
    .select(`
      *,
      portfolio_holdings (
        id, ticker, total_shares, avg_buy_price, updated_at
      )
    `)
    .eq("user_id", userId);

  if (error) throw error;
  return data;
};

export const optimizePortfolioService = async (
  userId: string,
  tickers: string[],
  riskTolerance?: number | null,
  method?: string,
  periodKey?: string,
) => {
  if (!tickers || tickers.length < 2) {
    throw new Error("Minimal 2 saham dibutuhkan untuk melakukan optimasi portofolio.");
  }

  // 1. Ambil data profil risiko & skor user
  const user = await getUserProfileService(userId);
  if (!user) {
    throw new Error("Profil pengguna tidak ditemukan.");
  }

  const mlProfile = mapUserRiskToMLProfile(user.risk_profile || "capybara");

  // 2. Tentukan toleransi risiko (slider 0.0 - 1.0):
  //    - Jika user menggeser slider di frontend → pakai nilai tersebut.
  //    - Jika tidak (undefined/null) → kirim null agar ML memakai default
  //      sesuai profil risiko user (default_risk_tolerance per profil).
  let effectiveRiskTolerance: number | null = null;
  if (riskTolerance !== undefined && riskTolerance !== null) {
    // Clamp ke rentang valid [0, 1]
    effectiveRiskTolerance = Math.min(1, Math.max(0, Number(riskTolerance)));
    if (Number.isNaN(effectiveRiskTolerance)) {
      effectiveRiskTolerance = null;
    }
  }

  // 3. Tambahkan akhiran .JK (format Yahoo Finance) untuk kebutuhan fetch data historis ML
  const formattedTickers = tickers.map((t) => 
    t.endsWith(".JK") ? t : `${t.trim().toUpperCase()}.JK`
  );

  const allowedPeriods = ["3_bulan", "6_bulan", "1_tahun", "3_tahun", "5_tahun", "10_tahun"];
  const effectiveMethod = "mean_cvar";
  const effectivePeriod = allowedPeriods.includes(periodKey || "") ? periodKey : "1_tahun";

  // 4. Panggil microservice ML (FastAPI)
  const mlResponse = await aiClient.post("/api/ai/optimize", {
    tickers: formattedTickers,
    risk_profile: mlProfile,
    risk_tolerance: effectiveRiskTolerance,
    period_key: effectivePeriod,
    method: effectiveMethod,
  });

  if (!mlResponse.data || !mlResponse.data.success) {
    throw new Error("Gagal memperoleh kalkulasi optimasi dari AI Service.");
  }

  // 5. Bersihkan nama ticker hasil kembalian (hapus suffix .JK untuk keselarasan frontend)
  const rawWeights = mlResponse.data.data.weights;
  const cleanWeights: Record<string, number> = {};
  for (const [key, value] of Object.entries(rawWeights)) {
    const cleanKey = key.replace(".JK", "");
    cleanWeights[cleanKey] = value as number;
  }

  const pairwiseDownside = (mlResponse.data.data.metadata?.pairwise_downside || []).map(
    (pair: any) => ({
      ...pair,
      ticker_a: String(pair.ticker_a).replace(".JK", ""),
      ticker_b: String(pair.ticker_b).replace(".JK", ""),
    }),
  );

  return {
    weights: cleanWeights,
    metrics: mlResponse.data.data.metrics,
    method: mlResponse.data.data.method,
    risk_profile: mlProfile,
    metadata: {
      ...mlResponse.data.data.metadata,
      pairwise_downside: pairwiseDownside,
    },
  };
};
