import { getAllStocks } from "../models/stock.model.js";

export const fetchAllStocksService = async () => {
  const stocks = await getAllStocks();

  if (!stocks || stocks.length === 0) {
    throw new Error("Data saham tidak ditemukan atau masih kosong.");
  }

  return stocks;
};
