import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import {
  BuyStockPayload,
  buyStockService,
  sellStockService,
  SellStockPayload,
  getStockTransactionsService
} from "../services/transaction.service.js";

export const buyStockController = catchAsync(async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user.id;
  const result = await buyStockService(userId, req.body as BuyStockPayload);

  res.status(200).json({
    success: true,
    message: `Berhasil membeli saham ${req.body.ticker}`,
    data: result,
  });
});

export const sellStockController = catchAsync(async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user.id as string;
  const result = await sellStockService(userId, req.body as SellStockPayload);

  res.status(200).json({
    success: true,
    message: `Berhasil menjual saham ${req.body.ticker}!`,
    data: result,
  });
});

// src/controllers/transaction.controller.ts

export const getStockTransactionsController = catchAsync(async (
  req: AuthRequest,
  res: Response,
) => {
  // Ambil dari params URL: /api/transactions/portfolio/:portfolioId/stock/:ticker
  const { portfolioId, ticker } = req.params;

  const result = await getStockTransactionsService(portfolioId as string, ticker as string);

  res.status(200).json({
    success: true,
    message: `Riwayat transaksi ${ticker} berhasil diambil`,
    data: result,
  });
});
