import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  createPortfolioController,
  getPortfolioDetailController,
  getUserPortfoliosController,
} from "../controllers/portfolio.controller.js";

const portfolioRouter = express.Router();

portfolioRouter.get("/", requireAuth, getUserPortfoliosController);
portfolioRouter.post("/", requireAuth, createPortfolioController);
portfolioRouter.get("/:id", requireAuth, getPortfolioDetailController);

export default portfolioRouter;
