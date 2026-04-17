import {
  getPortfolioHolding,
  upsertPortfolioHolding,
} from "../models/holding.model.js";
import {
  getPortfolioById,
  updatePortfolioBalance,
  getPortfolioWithHoldings
} from "../models/portfolio.model.js";

export interface BuyStockPayload {
  portfolio_id: string;
  ticker: string;
  lots: number;
  current_price: number; // ini diambil dari API FE
}

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

  return {
    transaction_detail: {
      action: "BUY",
      ticker,
      lots,
      price_per_share: current_price,
      total_cost: totalCost,
    },
    updated_potfolio: updatePortfolio,
    holding: holding,
  };
};
