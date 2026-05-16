import supabase from "../config/supabase.js";
import {
  createUserInDB,
  findUserById,
  updateUserById,
  UserInsert,
} from "../models/user.model.js";
import { fetchRecommendedStocksService } from "./stock.service.js";
import { enrichWithRealtimeQuotes } from "../utils/stock.utils.js";
import { 
  calculatePortfolioMetrics, 
  calculateAllocationPercentage 
} from "../utils/calculation.util.js";

// Ini data payload register
export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

// ini data payload login
export interface LoginPayload {
  email: string;
  password: string;
}

// logic buat register
export const registerUserService = async (body: RegisterPayload) => {
  const { first_name, last_name, email, password } = body;

  // ini buat daftarin data auth ke supabase
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error("Gagal membuat user di autentikasi");
  }

  // gunain id buat masuk ke tabel public.users
  const newUserData: UserInsert = {
    id: authData.user.id,
    first_name,
    last_name,
    email,
  };

  // simpen ke database
  return await createUserInDB(newUserData);
};

// logic buat login
export const loginUserService = async (body: LoginPayload) => {
  const { email, password } = body;

  // cek/buka brankas di supabase
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError) {
    throw new Error("Email atau password salah");
  }

  if (!authData.user || !authData.session) {
    throw new Error("Gagal mengambil sesi login");
  }

  // ambil data profil dari tabel public.user
  const userProfile = await findUserById(authData.user.id);

  // return access token sama data profile nya
  return {
    token: authData.session.access_token,
    user: userProfile,
  };
};

import { PERSONA_DESCRIPTIONS } from "../constants/personas.js";

export const getDashboardSummaryService = async (userId: string) => {
  // 1. Ambil Profil User (Nama & Persona)
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("first_name, risk_profile, risk_score")
    .eq("id", userId)
    .single();
  if (userError) throw new Error("Gagal mengambil data user.");

  // 2. Ambil Dompet Utama
  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", userId)
    .single();
  if (walletError) throw new Error("Gagal mengambil data dompet.");

  // 3. Ambil Daftar Portofolio (dengan holdings)
  const { data: portfolios, error: portoError } = await supabase
    .from("portfolios")
    .select(`
      id, name, cash_balance, invested_balance,
      portfolio_holdings ( ticker, total_shares, avg_buy_price )
    `)
    .eq("user_id", userId);
  if (portoError) throw new Error("Gagal mengambil data portofolio.");

  // 4. Ambil Harga Live Semua Kepemilikan (Untuk Kalkulasi Profit)
  const uniqueTickers = new Set<string>();
  if (portfolios) {
    portfolios.forEach((p: any) => {
      p.portfolio_holdings?.forEach((h: any) => uniqueTickers.add(h.ticker));
    });
  }
  const tickerArray = Array.from(uniqueTickers).map(t => ({ ticker: t }));
  const liveQuotes = await enrichWithRealtimeQuotes(tickerArray);
  const quotesMap = new Map();
  liveQuotes.forEach(q => quotesMap.set(q.ticker, q.current_price));

  // 5. Hitung Ringkasan Alokasi & Profit/Loss
  let totalAllocated = 0;

  const portfolioSummary = portfolios
    ? portfolios.map((p: any) => {
        const metrics = calculatePortfolioMetrics(
          p.portfolio_holdings || [],
          p.invested_balance,
          p.cash_balance,
          quotesMap
        );
        
        totalAllocated += metrics.total_value;

        return {
          id: p.id,
          name: p.name,
          cash_balance: Number(p.cash_balance),
          invested_balance: Number(p.invested_balance),
          ...metrics
        };
      })
    : [];

  const mainBalance = Number(wallet?.balance || 0);
  const totalAssets = mainBalance + totalAllocated;

  // Hitung persentase alokasi menggunakan util
  const allocationPercentage = calculateAllocationPercentage(totalAllocated, totalAssets);

  // 5. Ambil Rekomendasi Saham (Menggunakan service yang kita buat sebelumnya!)
  const recommendationsData = await fetchRecommendedStocksService(userId);
  console.log(`DEBUG: User ${userId} (${user.risk_profile}) target ${recommendationsData.mapped_risk_level} got ${recommendationsData.recommendations.length} stocks`);

  // 6. Jahit Semua Data
  const personaLokal = user?.risk_profile?.toLowerCase() || "capybara";

  return {
    user_info: {
      greeting: `Haloo, ${user.first_name}`,
      risk_profile: user.risk_profile,
      risk_score: user.risk_score ?? 0,
      profile_description:
        PERSONA_DESCRIPTIONS[personaLokal] || PERSONA_DESCRIPTIONS["capybara"],
    },
    wallet_summary: {
      main_wallet_balance: mainBalance,
      total_assets: totalAssets,
      total_allocated_to_portfolio: totalAllocated,
      allocation_percentage: `${allocationPercentage}%`,
    },
    portfolios: portfolioSummary,
    recommended_stocks: recommendationsData.recommendations,
  };
};

export const getUserProfileService = async (userId: string) => {
  return await findUserById(userId);
};

export const updateUserProfileService = async (userId: string, updates: any) => {
  return await updateUserById(userId, updates);
};
