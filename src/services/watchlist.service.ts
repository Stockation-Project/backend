import {
  getUserWatchlistFromDB,
  addTickerToWatchlist,
  removeTickerFromWatchlist,
  checkIsOnWatchlist
} from "../models/watchlist.model.js";
import { enrichWithRealtimeQuotes } from "../adapters/yahoo.adapter.js";
import { getCache, setCache, getSmartTTL, delCache } from "../utils/redis.util.js";

export const getWatchlistService = async (userId: string) => {
  const cacheKey = `watchlist:${userId}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const rawWatchlist = await getUserWatchlistFromDB(userId);
  if (!rawWatchlist || rawWatchlist.length === 0) return [];

  // Map to tickers for enrichment
  const tickers = rawWatchlist.map((w: any) => ({
    ticker: w.ticker,
    name: w.stocks?.name,
    is_anomaly: w.stocks?.is_anomaly,
    risk_level: w.stocks?.risk_level,
    sector: w.stocks?.sector
  }));

  const enriched = await enrichWithRealtimeQuotes(tickers);
  
  await setCache(cacheKey, getSmartTTL(), enriched);
  return enriched;
};

export const toggleWatchlistService = async (userId: string, ticker: string) => {
  const isOnWatchlist = await checkIsOnWatchlist(userId, ticker);
  
  if (isOnWatchlist) {
    await removeTickerFromWatchlist(userId, ticker);
    // Clear cache
    const cacheKey = `watchlist:${userId}`;
    await delCache(cacheKey);
    return { status: "removed", ticker };
  } else {
    await addTickerToWatchlist(userId, ticker);
    // Clear cache
    const cacheKey = `watchlist:${userId}`;
    await delCache(cacheKey);
    return { status: "added", ticker };
  }
};
