import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { createPortfolioController, getPortfolioDetailController } from "../controllers/portfolio.controller.js";

const portfolioRouter = express.Router();

portfolioRouter.post("/", requireAuth, createPortfolioController);
portfolioRouter.get("/:id", requireAuth, getPortfolioDetailController);

export default portfolioRouter;
