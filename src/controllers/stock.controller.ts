import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  fetchAllStocksService,
  fetchStockDetailService,
  fetchExploreStocksService,
  fetchRecommendedStocksService,
} from "../services/stock.service.js";
import { 
  syncStocksMetadataService, 
  seedIdx80Service 
} from "../services/maintenance.service.js";
import { syncClusteringRiskService } from "../services/ai.service.js";
import { checkIsOnWatchlist } from "../models/watchlist.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";

export const syncStocksController = catchAsync(async (req: Request, res: Response) => {
  const report = await syncStocksMetadataService();
  res.status(200).json({
    success: true,
    message: "Proses sinkronisasi selesai",
    data: report,
  });
});

export const syncClusteringController = catchAsync(async (req: Request, res: Response) => {
  const report = await syncClusteringRiskService();
  res.status(200).json({
    success: true,
    message: "Sinkronisasi risk level saham berdasarkan clustering AI selesai!",
    data: report,
  });
});


// Pastikan kamu mengimpor seedIdx80Service dari stock.service.js
export const seedStocksController = catchAsync(async (req: Request, res: Response) => {
  const report = await seedIdx80Service();
  res.status(200).json({
    success: true,
    message: "Proses penanaman 80 saham dan sinkronisasi otomatis selesai!",
    data: report,
  });
});

export const getStocksController = catchAsync(async (
  req: AuthRequest,
  res: Response,
) => {
  const stocks = await fetchAllStocksService();

  res.status(200).json({
    success: true,
    message: "Berhasil mengambil data saham",
    data: stocks,
  });
});

export const getStockDetailController = catchAsync(async (
  req: AuthRequest,
  res: Response,
) => {
  const ticker = req.params.ticker as string;
  const userId = req.user.id;
  
  const detail = await fetchStockDetailService(ticker);
  const isOnWatchlist = await checkIsOnWatchlist(userId, ticker);

  res.status(200).json({
    success: true,
    message: `Berhasil mengambil detail saham ${ticker}`,
    data: {
      ...detail,
      is_watchlist: isOnWatchlist
    },
  });
});

export const getExploreStocksController = catchAsync(async (
  req: AuthRequest,
  res: Response,
) => {
  const data = await fetchExploreStocksService();

  res.status(200).json({
    success: true,
    message: "Berhasil mengambil data Explore (Gainers & Losers)",
    data: data,
  });
});

export const getRecommendedStocksController = catchAsync(async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user.id as string; // Ambil ID dari token JWT
  const data = await fetchRecommendedStocksService(userId);

  res.status(200).json({
    success: true,
    message: `Berhasil mengambil rekomendasi saham untuk profil ${data.user_risk_profile}`,
    data: data,
  });
});
