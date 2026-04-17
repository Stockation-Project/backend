import { AuthRequest } from "../middleware/auth.middleware.js";
import { Response } from "express";
import {
  CreatePortfolioPayload,
  createPortfolioService,
} from "../services/portfolio.service.js";

export const createPortfolioController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user.id;
    console.log("Mencoba membuat porto untuk User ID:", userId);
    const result = await createPortfolioService(
      userId,
      req.body as CreatePortfolioPayload,
    );

    res.status(201).json({
      success: true,
      message: `Portfolio '${req.body.name}' berhasil dibuat`,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
