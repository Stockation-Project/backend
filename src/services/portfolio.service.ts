import { createPortfolioInDb, getPortfolioWithHoldings } from "../models/portfolio.model.js";
import { deductWalletBalance, getWalletById } from "../models/wallet.model.js";

export interface CreatePortfolioPayload {
  name: string;
  allocated_fund: number;
}

export const createPortfolioService = async (
  userId: string,
  payload: CreatePortfolioPayload,
) => {
  const { name, allocated_fund } = payload;

  // gabisa input dana 0
  if (allocated_fund <= 0) {
    throw new Error("Alokasi dana harus lebih dari 0");
  }

  // cek isi saldo global wallet
  const wallet = await getWalletById(userId);

  // Tambahkan pengecekan ini:
  if (!wallet) {
    throw new Error(
      "Dompet Utama tidak ditemukan. Pastikan Anda sudah mengisi kuesioner untuk mendapatkan modal awal.",
    );
  }

  if (!wallet || wallet.balance < allocated_fund) {
    throw new Error("Saldo Dompet Utama tidak mencukupi, silakan Top Up");
  }

  // potong saldo global wallet
  await deductWalletBalance(wallet.id, wallet.balance, allocated_fund);

  // buar card porto baru
  const newPortfolio = await createPortfolioInDb(userId, name, allocated_fund);

  return {
    portfolio: newPortfolio,
    remaining_main_balance: wallet.balance - allocated_fund,
  };
};

export const fetchPortfolioDetailService = async (
  portfolioId: string,
  userId: string,
) => {
  const portfolio = await getPortfolioWithHoldings(portfolioId, userId);

  if (!portfolio) {
    throw new Error(
      "Portofolio tidak ditemukan atau Anda tidak memiliki akses.",
    );
  }

  return portfolio;
};

export const fetchAllUserPortfoliosService = async (userId: string) => {
  const { data, error } = await (await import("../config/supabase.js")).default
    .from("portfolios")
    .select(`
      *,
      portfolio_holdings (
        id, ticker, total_shares, avg_buy_price, updated_at
      )
    `)
    .eq("user_id", userId);

  if (error) throw error;
  return data;
};
