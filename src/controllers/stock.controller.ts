import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { fetchAllStocksService } from "../services/stock.service.js";

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
