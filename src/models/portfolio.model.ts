import supabase from "../config/supabase.js";

export const createPortfolioInDb = async (
  userId: string,
  name: string,
  initialCash: number,
) => {
  const { data, error } = await supabase
    .from("portfolios")
    .insert([
      {
        user_id: userId,
        name: name,
        cash_balance: initialCash,
        invested_balance: 0,
      },
    ])
    .select();

  if (error) throw error;
  return data[0];
};
