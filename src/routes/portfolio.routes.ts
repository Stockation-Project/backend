import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  createPortfolioController,
  getPortfolioDetailController,
  getUserPortfoliosController,
  optimizePortfolioController,
} from "../controllers/portfolio.controller.js";

const portfolioRouter = express.Router();

portfolioRouter.get("/", requireAuth, getUserPortfoliosController);
portfolioRouter.post("/", requireAuth, createPortfolioController);
portfolioRouter.get("/:id", requireAuth, getPortfolioDetailController);
portfolioRouter.post("/optimize", requireAuth, optimizePortfolioController);

export default portfolioRouter;
