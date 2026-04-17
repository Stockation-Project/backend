import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { createPortfolioController } from "../controllers/portfolio.controller.js";

const portfolioRouter = express.Router();

portfolioRouter.post("/", requireAuth, createPortfolioController);

export default portfolioRouter;
