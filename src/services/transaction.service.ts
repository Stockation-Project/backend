import supabase from "../config/supabase.js";
import {
  getPortfolioHolding,
  upsertPortfolioHolding,
  deletePortfolioHolding,
} from "../models/holding.model.js";
import {
  getPortfolioById,
  updatePortfolioBalance,
  getPortfolioWithHoldings,
} from "../models/portfolio.model.js";
import {
  insertTransaction,
  getTransactionsByPortfolioAndTicker
} from "../models/transaction.model.js";

export interface BuyStockPayload {
  portfolio_id: string;
  ticker: string;
  lots: number;
  current_price: number; // ini diambil dari API FE
}

export interface SellStockPayload {
  portfolio_id: string;
  ticker: string;
  lots: number;
  current_price: number;
}

// ini logic buat beli saham yee
export const buyStockService = async (
  userId: string,
  payload: BuyStockPayload,
) => {
  const { portfolio_id, ticker, lots, current_price } = payload;

  // kalo user masukin 0 lot saham
  if (lots <= 0) {
    throw new Error("Jullah lots harus lebih dari 0");
  }

  // hitung total biaya (1lot = 100lembar)
  const sharesToBuy = lots * 100;
  const totalCost = sharesToBuy * current_price;

  // cek porto user, ada + apakah punya dia
  const portfolio = await getPortfolioById(portfolio_id, userId);
  if (!portfolio) {
    throw new Error(
      `Saldo tidak cukup. Butuh ${totalCost} untuk membeli ${lots} Lot ${ticker}`,
    );
  }

  // cek user udah punya saham ini atau belum di porto nya
  const existingHolding = await getPortfolioHolding(portfolio_id, ticker);

  let newTotalShares = sharesToBuy;
  let newAvgPrice = current_price;

  if (existingHolding) {
    // jika user udah punya, kkita itung avg price yang baru
    newTotalShares = existingHolding.total_shares + sharesToBuy;

    const oldTotalValue =
      existingHolding.total_shares * existingHolding.avg_buy_price;

    newAvgPrice = (oldTotalValue + totalCost) / newTotalShares;
  }

  // catat kepemilikan saham di database
  const holding = await upsertPortfolioHolding(
    portfolio_id,
    ticker,
    newTotalShares,
    newAvgPrice,
  );

  // potong cash nya dan tambahin invested balance nya
  const newCash = Number(portfolio.cash_balance) - totalCost;
  const newInvested = Number(portfolio.invested_balance) + totalCost;
  const updatePortfolio = await updatePortfolioBalance(
    portfolio_id,
    newCash,
    newInvested,
  );

  try {
    await insertTransaction({
      user_id: userId,
      portfolio_id: portfolio_id,
      ticker: ticker,
      type: "BUY",
      shares: sharesToBuy,
      price: current_price,
      total_amount: totalCost,
    });
  } catch (transactionError) {
    throw new Error("Gagal mencatat riwayat transaksi");
  }

  return {
    transaction_detail: {
      action: "BUY",
      ticker,
      lots,
      price_per_share: current_price,
      total_cost: totalCost,
    },
    updated_portfolio: updatePortfolio,
    holding: holding,
  };
};

// ini logic buat jual saham
export const sellStockService = async (
  userId: string,
  payload: SellStockPayload,
) => {
  const { portfolio_id, ticker, lots, current_price } = payload;
  if (lots <= 0) {
    throw new Error("Jumlah lots harus lebih dari 0");
  }

  const sharesToSell = lots * 100;
  // ini uang hasil jual
  const totalRevenue = sharesToSell * current_price;

  // cek portfolio
  const portfolio = await getPortfolioById(portfolio_id, userId);
  if (!portfolio) {
    throw new Error("Portfolio tidak ditemukan");
  }

  // cek apa user punya saham ini atau engga
  const existingHolding = await getPortfolioHolding(portfolio_id, ticker);
  if (!existingHolding) {
    throw new Error(`Anda tidak memiliki saham ${ticker} di portfolio ini`);
  }

  // cek jumlah lembar saham, cukup ga buat dijual
  if (existingHolding.total_shares < sharesToSell) {
    throw new Error(
      `Lembar saham tidak cukup, anda hanya memiliki ${existingHolding.total_shares / 100} Lot ${ticker}`,
    );
  }

  // kalkulasi modal yang dikeluarkan
  const costBasicOfSoldShares = sharesToSell * existingHolding.avg_buy_price;
  const realizedProfit = totalRevenue - costBasicOfSoldShares;

  // update atau hapus holding
  const remainingShares = (existingHolding.total_shares - sharesToSell);
  let updatedHolding = null;

  if (remainingShares === 0) {
    // jika user jual semua saham
    await deletePortfolioHolding(existingHolding.id);
  } else {
    // jika user jual sebagian saham
    updatedHolding = await upsertPortfolioHolding(
      portfolio_id,
      ticker,
      remainingShares,
      existingHolding.avg_buy_price,
    );
  }

  // update saldo di porto
  // cash nya nambah dari hasil jualan, inves nya ngurang sesuai modal awal yang dikeluarkan
  const newCash = Number(portfolio.cash_balance) + totalRevenue;
  const newInvested =
    Number(portfolio.invested_balance) - costBasicOfSoldShares;

  const updatedPortfolio = await updatePortfolioBalance(
    portfolio_id,
    newCash,
    newInvested,
  );

  try {
    await insertTransaction({
      user_id: userId,
      portfolio_id: portfolio_id,
      ticker: ticker,
      type: "SELL",
      shares: sharesToSell,
      price: current_price,
      total_amount: totalRevenue,
    });
  } catch (transactionError) {
    throw new Error("Gagal mencatat riwayat transaksi");
  }

  return {
    transaction_detail: {
      action: "SELL",
      ticker,
      lots_sold: lots,
      sell_price: current_price,
      total_revenue: totalRevenue,
      realized_profit_loss: realizedProfit,
    },
    updated_portfolio: updatedPortfolio,
    holding: updatedHolding ? updatedHolding : "Saham habis terjual",
  };
};

export const getStockTransactionsService = async (portfolioId: string, ticker: string) => {
  try {
    const data = await getTransactionsByPortfolioAndTicker(portfolioId, ticker);
    return data;
  } catch (error: any) {
    throw new Error("Gagal mengambil riwayat transaksi: " + error.message);
  }
};
