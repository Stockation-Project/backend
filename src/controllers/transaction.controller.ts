import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  BuyStockPayload,
  buyStockService,
} from "../services/transaction.service.js";

export const buyStockController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user.id;
    const result = await buyStockService(userId, req.body as BuyStockPayload);

    res.status(200).json({
      success: true,
      message: `Berhasil membeli saham ${req.body.ticker}`,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
