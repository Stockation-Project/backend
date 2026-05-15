import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { fetchExploreStocksService } from "../services/stock.service.js";
import { getWatchlistService, toggleWatchlistService } from "../services/watchlist.service.js";

export const getMarketMoversController = async (req: AuthRequest, res: Response) => {
  try {
    const data = await fetchExploreStocksService();
    res.status(200).json({
      success: true,
      data
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getWatchlistController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const data = await getWatchlistService(userId);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const toggleWatchlistController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { ticker } = req.body;
    
    if (!ticker) {
      return res.status(400).json({
        success: false,
        message: "Ticker is required"
      });
    }

    const result = await toggleWatchlistService(userId, ticker);
    res.status(200).json({
      success: true,
      message: `Successfully ${result.status} ${ticker}`,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
