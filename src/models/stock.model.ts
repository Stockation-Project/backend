import supabase from "../config/supabase.js";

export const getAllStocks = async () => {
  // Mengambil semua data saham dari database
  const { data, error } = await supabase
    .from("stocks")
    .select("*")
    .order("ticker", { ascending: true });

  if (error) throw error;
  return data;
};

export const getStockDetailFromDB = async (ticker: string) => {
  const { data, error } = await supabase
    .from("stocks")
    .select("*")
    .eq("ticker", ticker)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// ini buat ambil profile user dari db
export const getUserRiskProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("risk_profile")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error("Gagal mengambil profile resiko user");
  }

  return data.risk_profile;
};

// ini buat ngambil saham sesuai profile resiko user
export const getStocksByRiskLevel = async (riskLevel: string) => {
  const { data, error } = await supabase
    .from("stocks")
    .select("*")
    .eq("risk_level", riskLevel);

  if (error) {
    throw new Error("Gagal mengambil data saham berhasarkan risk level");
  }

  return data;
};

export const updateStockAnomalyStatus = async (ticker: string, isAnomaly: boolean) => {
  const { error } = await supabase
    .from("stocks")
    .update({ is_anomaly: isAnomaly })
    .eq("ticker", ticker);

  if (error) {
    console.error(`Gagal update status anomali untuk ${ticker}:`, error.message);
  }
};
