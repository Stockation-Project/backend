// Di dalam controller (misal wallet.controller.ts)
import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js"; // PASTIKAN PATH-NYA BENAR
import { addWalletBalance } from "../models/wallet.model.js";

export const topUpWallet = async (req: AuthRequest, res: Response) => {
  try {
    // Tambahkan pengaman ekstra (optional, tapi disukai TypeScript)
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ success: false, message: "Akses ditolak." });
    }

    const userId = req.user.id; // TypeScript sekarang tersenyum melihat ini
    const { amount } = req.body;

    if (!amount || typeof amount !== "number") {
      return res
        .status(400)
        .json({ success: false, message: "Nominal tidak valid" });
    }

    const updatedWallet = await addWalletBalance(userId, amount);

    res.status(200).json({
      success: true,
      message: "Top up berhasil",
      data: updatedWallet,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
