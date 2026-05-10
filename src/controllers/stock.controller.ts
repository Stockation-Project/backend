import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  fetchAllStocksService,
  fetchStockDetailService,
  fetchExploreStocksService,
  fetchRecommendedStocksService,
  syncStocksMetadataService,
  seedIdx80Service,
} from "../services/stock.service.js";

export const syncStocksController = async (req: Request, res: Response) => {
  try {
    const report = await syncStocksMetadataService();
    res.status(200).json({
      success: true,
      message: "Proses sinkronisasi selesai",
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Pastikan kamu mengimpor seedIdx80Service dari stock.service.js
export const seedStocksController = async (req: Request, res: Response) => {
  try {
    const report = await seedIdx80Service();
    res.status(200).json({
      success: true,
      message: "Proses penanaman 80 saham dan sinkronisasi otomatis selesai!",
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

export const getRecommendedStocksController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user.id as string; // Ambil ID dari token JWT
    const data = await fetchRecommendedStocksService(userId);

    res.status(200).json({
      success: true,
      message: `Berhasil mengambil rekomendasi saham untuk profil ${data.user_risk_profile}`,
      data: data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
