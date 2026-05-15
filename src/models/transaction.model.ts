import supabase from "../config/supabase.js";

export const getTransactionsByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const getTransactionsByPortfolioId = async (portfolioId: string) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("portfolio_id", portfolioId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};
