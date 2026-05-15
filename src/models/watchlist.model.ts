import supabase from "../config/supabase.js";

export const getUserWatchlistFromDB = async (userId: string) => {
  const { data, error } = await supabase
    .from("watchlists")
    .select(`
      id,
      ticker,
      created_at,
      stocks (
        name,
        is_anomaly,
        risk_level,
        sector
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const addTickerToWatchlist = async (userId: string, ticker: string) => {
  const { data, error } = await supabase
    .from("watchlists")
    .insert([{ user_id: userId, ticker }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removeTickerFromWatchlist = async (userId: string, ticker: string) => {
  const { error } = await supabase
    .from("watchlists")
    .delete()
    .eq("user_id", userId)
    .eq("ticker", ticker);

  if (error) throw error;
  return true;
};

export const checkIsOnWatchlist = async (userId: string, ticker: string) => {
  const { data, error } = await supabase
    .from("watchlists")
    .select("id")
    .eq("user_id", userId)
    .eq("ticker", ticker)
    .maybeSingle();

  if (error) throw error;
  return !!data;
};
