// src/utils/calculation.util.ts

/**
 * Menghitung ringkasan profit dan alokasi untuk satu portofolio
 */
export const calculatePortfolioMetrics = (
  holdings: any[],
  investedBalance: number,
  cashBalance: number,
  quotesMap: Map<string, number>
) => {
  const investedBal = Number(investedBalance);
  const totalValue = Number(cashBalance) + investedBal;
  let currentInvestedValue = 0;

  const allocations = holdings.map((h: any) => {
    const cost = h.total_shares * h.avg_buy_price;
    const percentage = investedBal > 0 ? (cost / investedBal) * 100 : 0;
    
    // Gunakan harga live jika tersedia, jika tidak gunakan harga beli
    const currentPrice = quotesMap.get(h.ticker) || h.avg_buy_price;
    currentInvestedValue += h.total_shares * currentPrice;

    return {
      ticker: h.ticker,
      percentage: Number(percentage.toFixed(1)),
    };
  });

  const profitAmount = currentInvestedValue - investedBal;
  const profitPercentage = investedBal > 0 ? (profitAmount / investedBal) * 100 : 0;

  return {
    total_value: totalValue,
    allocations,
    profitAmount,
    profitPercentage: Number(profitPercentage.toFixed(2))
  };
};

/**
 * Menghitung persentase alokasi aset terhadap total kekayaan
 */
export const calculateAllocationPercentage = (totalAllocated: number, totalAssets: number): string => {
  if (totalAssets <= 0) return "0%";
  return `${((totalAllocated / totalAssets) * 100).toFixed(1)}%`;
};
