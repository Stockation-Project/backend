import { createPortfolioInDb } from "../models/portfolio.model.js";
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
};;
