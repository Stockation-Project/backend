import supabase from "../config/supabase.js";
import {
  createUserInDB,
  findUserById,
  updateUserById,
  UserInsert,
} from "../models/user.model.js";
import { fetchRecommendedStocksService } from "./stock.service.js";
import { enrichWithRealtimeQuotes } from "../utils/stock.utils.js";

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

// Kamus Penjelasan Persona
const personaDescriptions: Record<string, string> = {
  lion: "Seperti Singa yang agresif, kamu sangat berani mengambil risiko tinggi demi imbal hasil maksimal. Fluktuasi tajam adalah taman bermainmu.",
  wolf: "Seperti Serigala yang taktis, kamu berani bermanuver di pasar dengan perhitungan yang matang untuk mengejar pertumbuhan aset.",
  capybara:
    "Seperti Capybara yang santai, kamu menyeimbangkan antara keamanan dan pertumbuhan. Risiko moderat adalah zona nyamanmu.",
  hippo:
    "Seperti Kuda Nil yang tenang, kamu lebih suka berdiam di perairan investasi yang aman dan stabil untuk melindungi nilai uangmu.",
  turtle:
    "Seperti Kura-kura yang stabil, kamu sangat berhati-hati dan mengutamakan keamanan modal di atas segalanya. Lambat tapi pasti.",
};

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
        const totalValue = Number(p.cash_balance) + Number(p.invested_balance);
        totalAllocated += totalValue;
        
        // Kalkulasi allocations & profit
        const holdings = p.portfolio_holdings || [];
        const investedBal = Number(p.invested_balance);
        let currentInvestedValue = 0;
        
        const allocations = holdings.map((h: any) => {
          const cost = h.total_shares * h.avg_buy_price;
          const percentage = investedBal > 0 ? (cost / investedBal) * 100 : 0;
          
          const currentPrice = quotesMap.get(h.ticker) || h.avg_buy_price;
          currentInvestedValue += h.total_shares * currentPrice;

          return {
            ticker: h.ticker,
            percentage: Number(percentage.toFixed(1)),
          };
        });

        const profitAmount = currentInvestedValue - investedBal;
        const profitPercentage = investedBal > 0 ? (profitAmount / investedBal) * 100 : 0;

        return {
          id: p.id,
          name: p.name,
          cash_balance: Number(p.cash_balance),
          invested_balance: investedBal,
          total_value: totalValue,
          allocations: allocations,
          profitAmount: profitAmount,
          profitPercentage: Number(profitPercentage.toFixed(2))
        };
      })
    : [];

  const mainBalance = Number(wallet?.balance || 0);
  const totalAssets = mainBalance + totalAllocated;

  // Hitung persentase alokasi (jangan sampai dibagi nol)
  const allocationPercentage =
    totalAssets > 0
      ? ((totalAllocated / totalAssets) * 100).toFixed(1) // Membulatkan 1 angka di belakang koma
      : 0;

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
        personaDescriptions[personaLokal] || personaDescriptions["capybara"],
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
