import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  topUpService,
  allocateFundsService,
  withdrawToGlobalService,
} from "../services/wallet.service.js";

export const topUpWallet = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Akses ditolak");

    const { amount } = req.body;
    const data = await topUpService(userId, amount);

    res.status(200).json({
      success: true,
      message: "Top up berhasil",
      data,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const allocateFunds = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Akses ditolak");

    const { portfolio_id, amount } = req.body;
    const data = await allocateFundsService(userId, portfolio_id, amount);

    res.status(200).json({
      success: true,
      message: "Alokasi dana berhasil",
      data,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const withdrawFunds = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Akses ditolak");

    const { portfolio_id, amount } = req.body;
    const data = await withdrawToGlobalService(userId, portfolio_id, amount);

    res.status(200).json({
      success: true,
      message: "Penarikan dana berhasil",
      data,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getUserWallet = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Akses ditolak");

    const { getWalletById } = await import("../models/wallet.model.js");
    const wallet = await getWalletById(userId);

    res.status(200).json({
      success: true,
      data: wallet ? [wallet] : [],
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
