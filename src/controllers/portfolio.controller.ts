import { AuthRequest } from "../middleware/auth.middleware.js";
import { Response } from "express";
import {
  createPortfolioService,
  fetchPortfolioDetailService,
  fetchAllUserPortfoliosService,
  CreatePortfolioPayload,
  optimizePortfolioService,
} from "../services/portfolio.service.js";
import { catchAsync } from "../utils/catchAsync.js";

export const createPortfolioController = catchAsync(async (
  req: AuthRequest,
  res: Response,
) => {
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
});

export const getPortfolioDetailController = catchAsync(async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user.id as string
  // Mengambil ID portofolio dari URL parameter (misal: /api/portfolios/123)
  const portfolioId = req.params.id as string

  const result = await fetchPortfolioDetailService(portfolioId, userId);

  res.status(200).json({
    success: true,
    message: "Berhasil mengambil detail portofolio",
    data: result,
  });
});

export const getUserPortfoliosController = catchAsync(async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user.id as string;
  const portfolios = await fetchAllUserPortfoliosService(userId);

  res.status(200).json({
    success: true,
    data: portfolios,
  });
});

export const optimizePortfolioController = catchAsync(async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user.id;
  const { tickers } = req.body;

  const result = await optimizePortfolioService(userId, tickers);

  res.status(200).json({
    success: true,
    data: result,
  });
});
