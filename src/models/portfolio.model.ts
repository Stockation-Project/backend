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

// ambil data portfolio
export const getPortfolioById = async (portfolioId: string, userId: string) => {
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("id", portfolioId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// update saldo di portfolio
export const updatePortfolioBalance = async (
  portfolioId: string,
  newCash: number,
  newInvested: number,
) => {
  const { data, error } = await supabase
    .from("portfolios")
    .update({
      cash_balance: newCash,
      invested_balance: newInvested,
    })
    .eq("id", portfolioId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

// narik data dari tabel portfolio holdings
export const getPortfolioWithHoldings = async (
  portfolioId: string,
  userId: string,
) => {
  const { data, error } = await supabase
    .from("portfolios")
    .select(
      `
      *,
      portfolio_holdings (
        id,
        ticker,
        total_shares,
        avg_buy_price,
        updated_at
      )
    `,
    )
    .eq("id", portfolioId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// narik semua portfolio beserta holdings untuk summary dashboard
export const getAllUserPortfoliosWithHoldings = async (userId: string) => {
  const { data, error } = await supabase
    .from("portfolios")
    .select(`
      id, name, cash_balance, invested_balance,
      portfolio_holdings ( ticker, total_shares, avg_buy_price )
    `)
    .eq("user_id", userId);

  if (error) throw error;
  return data;
};
