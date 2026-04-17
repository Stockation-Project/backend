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