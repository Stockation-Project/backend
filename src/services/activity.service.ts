import {
  getMutationsByUserId,
  getMutationsByPortfolioId,
} from "../models/mutation.model.js";
import {
  getTransactionsByUserId,
  getTransactionsByPortfolioId,
} from "../models/transaction.model.js";

export const getUnifiedHistoryService = async (
  userId: string,
  portfolioId?: string,
  filter?: string
) => {
  let mutations = [];
  let transactions = [];

  // Jika portfolioId ada, ambil data spesifik portfolio tersebut
  // Jika tidak, ambil semua data user (Global + Portfolios)
  if (portfolioId && portfolioId !== "all") {
    mutations = await getMutationsByPortfolioId(portfolioId);
    transactions = await getTransactionsByPortfolioId(portfolioId);
  } else {
    mutations = await getMutationsByUserId(userId);
    transactions = await getTransactionsByUserId(userId);
  }

  // Map ke format seragam (Unified Activity)
  const formattedMutations = mutations.map((m: any) => ({
    id: m.id,
    type: m.type, // TOP_UP, WITHDRAW, ALLOCATE
    amount: Number(m.amount),
    description: m.description,
    created_at: m.created_at,
    portfolio_id: m.portfolio_id,
    source: "mutation",
  }));

  const formattedTransactions = transactions.map((t: any) => ({
    id: t.id,
    type: t.type, // BUY, SELL
    amount: Number(t.total_amount),
    description: `${t.type === "BUY" ? "Beli" : "Jual"} ${t.ticker}`,
    created_at: t.created_at,
    portfolio_id: t.portfolio_id,
    source: "transaction",
    metadata: {
      ticker: t.ticker,
      shares: t.shares,
      price: Number(t.price),
    },
  }));

  // Gabung dan sortir berdasarkan waktu terbaru
  let combined = [...formattedMutations, ...formattedTransactions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Apply filter jika ada
  if (filter && filter !== "all") {
    combined = combined.filter((item) => {
      if (filter === "ALLOCATE") return item.type === "ALLOCATE";
      if (filter === "WITHDRAW") return item.type === "WITHDRAW";
      if (filter === "BUY") return item.type === "BUY";
      if (filter === "SELL") return item.type === "SELL";
      if (filter === "TOP_UP") return item.type === "TOP_UP";
      return true;
    });
  }

  return combined;
};
