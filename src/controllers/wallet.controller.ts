import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  topUpService,
  allocateFundsService,
  withdrawToGlobalService,
} from "../services/wallet.service.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";

export const topUpWallet = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Akses ditolak", 401);

  const { amount } = req.body;
  const data = await topUpService(userId, amount);

  res.status(200).json({
    success: true,
    message: "Top up berhasil",
    data,
  });
});

export const allocateFunds = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Akses ditolak", 401);

  const { portfolio_id, amount } = req.body;
  const data = await allocateFundsService(userId, portfolio_id, amount);

  res.status(200).json({
    success: true,
    message: "Alokasi dana berhasil",
    data,
  });
});

export const withdrawFunds = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Akses ditolak", 401);

  const { portfolio_id, amount } = req.body;
  const data = await withdrawToGlobalService(userId, portfolio_id, amount);

  res.status(200).json({
    success: true,
    message: "Penarikan dana berhasil",
    data,
  });
});

export const getUserWallet = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Akses ditolak", 401);

  const { getWalletById } = await import("../models/wallet.model.js");
  const wallet = await getWalletById(userId);

  res.status(200).json({
    success: true,
    data: wallet ? [wallet] : [],
  });
});
