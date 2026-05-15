import { addWalletBalance, deductWalletBalance, getWalletById } from "../models/wallet.model.js";
import { getPortfolioById, updatePortfolioBalance } from "../models/portfolio.model.js";
import { createMutation } from "../models/mutation.model.js";

export const topUpService = async (userId: string, amount: number) => {
  if (amount <= 0) throw new Error("Nominal top up harus lebih dari 0");

  const updatedWallet = await addWalletBalance(userId, amount);

  await createMutation({
    user_id: userId,
    portfolio_id: null,
    type: "TOP_UP",
    amount: amount,
    description: "Top Up Saldo Global",
  });

  return updatedWallet;
};

export const allocateFundsService = async (
  userId: string,
  portfolioId: string,
  amount: number
) => {
  if (amount <= 0) throw new Error("Alokasi dana harus lebih dari 0");

  const wallet = await getWalletById(userId);
  if (!wallet) throw new Error("Dompet utama tidak ditemukan");

  if (Number(wallet.balance) < amount) {
    throw new Error("Saldo dompet utama tidak mencukupi");
  }

  const portfolio = await getPortfolioById(portfolioId, userId);
  if (!portfolio) throw new Error("Portofolio tidak ditemukan");

  // 1. Potong saldo global
  await deductWalletBalance(wallet.id, Number(wallet.balance), amount);

  // 2. Tambah cash_balance portofolio
  const newCash = Number(portfolio.cash_balance) + amount;
  const updatedPortfolio = await updatePortfolioBalance(
    portfolioId,
    newCash,
    Number(portfolio.invested_balance)
  );

  // 3. Catat mutasi
  await createMutation({
    user_id: userId,
    portfolio_id: portfolioId,
    type: "ALLOCATE",
    amount: amount,
    description: `Alokasi dana ke ${portfolio.name}`,
  });

  return {
    portfolio: updatedPortfolio,
    remaining_wallet_balance: Number(wallet.balance) - amount,
  };
};

export const withdrawToGlobalService = async (
  userId: string,
  portfolioId: string,
  amount: number
) => {
  if (amount <= 0) throw new Error("Nominal penarikan harus lebih dari 0");

  const portfolio = await getPortfolioById(portfolioId, userId);
  if (!portfolio) throw new Error("Portofolio tidak ditemukan");

  if (Number(portfolio.cash_balance) < amount) {
    throw new Error("Saldo tersedia di portofolio tidak mencukupi");
  }

  // 1. Potong cash_balance portofolio
  const newCash = Number(portfolio.cash_balance) - amount;
  const updatedPortfolio = await updatePortfolioBalance(
    portfolioId,
    newCash,
    Number(portfolio.invested_balance)
  );

  // 2. Tambah saldo global
  const updatedWallet = await addWalletBalance(userId, amount);

  // 3. Catat mutasi
  await createMutation({
    user_id: userId,
    portfolio_id: portfolioId,
    type: "WITHDRAW",
    amount: amount,
    description: `Tarik dana dari ${portfolio.name} ke Global Wallet`,
  });

  return {
    portfolio: updatedPortfolio,
    new_wallet_balance: updatedWallet.balance,
  };
};
