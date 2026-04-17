import supabase from "../config/supabase.js";

export const getPortfolioHolding = async (
  portfolioId: string,
  ticker: string,
) => {
  const { data, error } = await supabase
    .from("portfolio_holdings")
    .select("*")
    .eq("portfolio_id", portfolioId)
    .eq("ticker", ticker)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const upsertPortfolioHolding = async (
  portfolioId: string,
  ticker: string,
  totalShares: number,
  avgBuyPrice: number,
) => {
  const { data, error } = await supabase
    .from("portfolio_holdings")
    .upsert(
      [
        {
          portfolio_id: portfolioId,
          ticker: ticker,
          total_shares: totalShares,
          avg_buy_price: avgBuyPrice,
        },
      ],
      {
        onConflict: "portfolio_id, ticker",
      },
    )
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};
