import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  BuyStockPayload,
  buyStockService,
  sellStockService,
  SellStockPayload,
  getStockTransactionsService
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

export const sellStockController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user.id as string;
    const result = await sellStockService(userId, req.body as SellStockPayload);

    res.status(200).json({
      success: true,
      message: `Berhasil menjual saham ${req.body.ticker}!`,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// src/controllers/transaction.controller.ts

export const getStockTransactionsController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // Ambil dari params URL: /api/transactions/portfolio/:portfolioId/stock/:ticker
    const { portfolioId, ticker } = req.params;

    const result = await getStockTransactionsService(portfolioId as string, ticker as string);

    res.status(200).json({
      success: true,
      message: `Riwayat transaksi ${ticker} berhasil diambil`,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
