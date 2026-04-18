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