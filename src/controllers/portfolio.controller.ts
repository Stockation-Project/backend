import { AuthRequest } from "../middleware/auth.middleware.js";
import { Response } from "express";
import {
  CreatePortfolioPayload,
  createPortfolioService,
  fetchPortfolioDetailService,
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

export const getPortfolioDetailController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user.id as string
    // Mengambil ID portofolio dari URL parameter (misal: /api/portfolios/123)
    const portfolioId = req.params.id as string

    const result = await fetchPortfolioDetailService(portfolioId, userId);

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil detail portofolio",
      data: result,
    });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};
