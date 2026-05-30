import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { fetchExploreStocksService } from "../services/stock.service.js";
import { getWatchlistService, toggleWatchlistService } from "../services/watchlist.service.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";

export const getMarketMoversController = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = await fetchExploreStocksService();
  res.status(200).json({
    success: true,
    data
  });
});

export const getWatchlistController = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const data = await getWatchlistService(userId);
  res.status(200).json({
    success: true,
    data
  });
});

export const toggleWatchlistController = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const { ticker } = req.body;
  
  if (!ticker) {
    throw new AppError("Ticker is required", 400);
  }

  const result = await toggleWatchlistService(userId, ticker);
  res.status(200).json({
    success: true,
    message: `Successfully ${result.status} ${ticker}`,
    data: result
  });
});
