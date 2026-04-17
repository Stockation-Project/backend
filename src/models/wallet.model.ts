import supabase from "../config/supabase.js";

// logic buat isiin wallet user
export const createWallet = async (
  userId: string,
  initialBalace: number = 100000000,
) => {
  const { data, error } = await supabase
    .from("wallets")
    .insert([
      {
        user_id: userId,
        balance: initialBalace,
      },
    ])
    .select();

  if (error) throw error;
  return data[0];
};

// dapetin wallet user
export const getWalletById = async (userId: string) => {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// kurangi dana utama user pas user bikin porto
export const deductWalletBalance = async (
  walletId: string,
  currentBalance: number,
  amount: number,
) => {
  const newBalance = currentBalance - amount;
  const { data, error } = await supabase
    .from("wallets")
    .update({ balance: newBalance })
    .eq("id", walletId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
