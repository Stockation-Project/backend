import supabase from "../config/supabase.js";

export interface Mutation {
  id: string;
  user_id: string;
  portfolio_id: string | null;
  type: "TOP_UP" | "WITHDRAW" | "ALLOCATE";
  amount: number;
  description: string | null;
  created_at: string;
}

export const createMutation = async (mutation: Partial<Mutation>) => {
  const { data, error } = await supabase
    .from("mutations")
    .insert([mutation])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getMutationsByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from("mutations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const getMutationsByPortfolioId = async (portfolioId: string) => {
  const { data, error } = await supabase
    .from("mutations")
    .select("*")
    .eq("portfolio_id", portfolioId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};
