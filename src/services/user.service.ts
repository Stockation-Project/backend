import supabase from "../config/supabase.js";
import {
  createUserInDB,
  findUserById,
  UserInsert,
} from "../models/user.model.js";
import { fetchRecommendedStocksService } from "./stock.service.js";

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
    .select("first_name, risk_profile")
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

  // 3. Ambil Daftar Portofolio
  const { data: portfolios, error: portoError } = await supabase
    .from("portfolios")
    .select("id, name, cash_balance, invested_balance")
    .eq("user_id", userId);
  if (portoError) throw new Error("Gagal mengambil data portofolio.");

  // 4. Hitung Ringkasan Alokasi
  let totalAllocated = 0;
  const portfolioSummary = portfolios
    ? portfolios.map((p) => {
        const totalValue = Number(p.cash_balance) + Number(p.invested_balance);
        totalAllocated += totalValue;
        return {
          id: p.id,
          name: p.name,
          total_value: totalValue,
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

  // 6. Jahit Semua Data
  const personaLokal = user?.risk_profile?.toLowerCase() || "capybara";

  return {
    user_info: {
      greeting: `Haloo, ${user.first_name}`,
      risk_profile: user.risk_profile,
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
