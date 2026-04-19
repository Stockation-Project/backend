import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  fetchAllStocksService,
  fetchStockDetailService,
  fetchExploreStocksService,
} from "../services/stock.service.js";

export const getStocksController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const stocks = await fetchAllStocksService();

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil data saham",
      data: stocks,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getStockDetailController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const ticker = req.params.ticker as string;
    const detail = await fetchStockDetailService(ticker);

    res.status(200).json({
      success: true,
      message: `Berhasil mengambil detail saham ${ticker}`,
      data: detail,
    });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const getExploreStocksController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const data = await fetchExploreStocksService();

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil data Explore (Gainers & Losers)",
      data: data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
