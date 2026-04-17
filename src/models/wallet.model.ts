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
