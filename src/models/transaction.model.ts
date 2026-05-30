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

export interface TransactionInsert {
  user_id: string;
  portfolio_id: string;
  ticker: string;
  type: "BUY" | "SELL";
  shares: number;
  price: number;
  total_amount: number;
}

export const insertTransaction = async (transaction: TransactionInsert) => {
  const { error } = await supabase.from("transactions").insert(transaction);
  if (error) throw error;
};

export const getTransactionsByPortfolioAndTicker = async (portfolioId: string, ticker: string) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("portfolio_id", portfolioId)
    .eq("ticker", ticker)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};
