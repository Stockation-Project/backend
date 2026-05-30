import supabase from "../config/supabase.js";
import { createClient } from "@supabase/supabase-js";
import {
  createUserInDB,
  findUserById,
  updateUserById,
  UserInsert,
} from "../models/user.model.js";
import { fetchRecommendedStocksService } from "./stock.service.js";
import { enrichWithRealtimeQuotes } from "../adapters/yahoo.adapter.js";
import { 
  calculatePortfolioMetrics, 
  calculateAllocationPercentage 
} from "../utils/calculation.util.js";
import { getWalletById } from "../models/wallet.model.js";
import { getAllUserPortfoliosWithHoldings } from "../models/portfolio.model.js";

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

export interface GoogleSyncPayload {
  user: any;
  session: any;
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

// logic buat sinkronisasi akun google
export const googleSyncService = async (body: GoogleSyncPayload) => {
  const { user, session } = body;
  
  if (!user || !session) {
    throw new Error("Data user atau sesi dari Google tidak valid");
  }

  let userProfile;
  try {
    userProfile = await findUserById(user.id);
  } catch (error: any) {
    // Jika tidak ditemukan, findUserById melempar error
    userProfile = null;
  }

  // Jika user belum ada di public.users, buat baru
  if (!userProfile) {
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "User";
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    const newUserData: UserInsert = {
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      email: user.email || "",
      avatar_url: user.user_metadata?.avatar_url || null,
    };

    userProfile = await createUserInDB(newUserData);
  }

  return {
    token: session.access_token,
    user: userProfile,
  };
};


import { PERSONA_DESCRIPTIONS } from "../constants/personas.js";

import { AppError } from "../utils/AppError.js";

export const getDashboardSummaryService = async (userId: string) => {
  // 1. Ambil Profil User (Nama & Persona)
  let user;
  try {
    user = await findUserById(userId);
  } catch (error) {
    throw new AppError("Gagal mengambil data user.", 404);
  }
  if (!user) throw new AppError("Gagal mengambil data user.", 404);

  // 2. Ambil Dompet Utama
  let wallet;
  try {
    wallet = await getWalletById(userId);
  } catch (error) {
    throw new AppError("Gagal mengambil data dompet.", 404);
  }
  if (!wallet) throw new AppError("Gagal mengambil data dompet.", 404);

  // 3. Ambil Daftar Portofolio (dengan holdings)
  let portfolios;
  try {
    portfolios = await getAllUserPortfoliosWithHoldings(userId);
  } catch (error) {
    throw new AppError("Gagal mengambil data portofolio.", 404);
  }

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
      allocation_percentage: allocationPercentage,
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

export const uploadAvatarService = async (userId: string, base64Image: string, userToken: string) => {
  // 1. Ekstrak format dan data riil dari Base64
  const matches = base64Image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  
  if (!matches || matches.length !== 3) {
    throw new Error("Format gambar base64 tidak valid");
  }

  const contentType = matches[1]; // misal: "image/png" atau "image/jpeg"
  const base64Data = matches[2];
  
  // Ubah Base64 string menjadi Buffer biner
  const fileBuffer = Buffer.from(base64Data, "base64");
  
  // Tentukan ekstensi file
  const fileExtension = contentType.split("/")[1] || "png";
  const fileName = `${userId}-${Date.now()}.${fileExtension}`;
  const filePath = `${userId}/${fileName}`; // Disimpan dalam folder per-user di bucket

  // Buat client Supabase terautentikasi khusus untuk user ini
  const userSupabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      },
    }
  );

  // 2. Upload file ke Supabase Storage menggunakan client terautentikasi user
  const { data: uploadData, error: uploadError } = await userSupabase.storage
    .from("avatars")
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Gagal mengunggah ke Storage: ${uploadError.message}`);
  }

  // 3. Dapatkan Public URL
  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  if (!urlData || !urlData.publicUrl) {
    throw new Error("Gagal mendapatkan public URL untuk avatar baru");
  }

  const publicUrl = urlData.publicUrl;

  // 4. Update data avatar_url di tabel users
  const updatedUser = await updateUserById(userId, { avatar_url: publicUrl });
  
  return updatedUser;
};
