import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  buyStockController,
  getStockTransactionsController,
  sellStockController,
} from "../controllers/transaction.controller.js";

const transactionRoutes = express.Router();

transactionRoutes.post("/buy", requireAuth, buyStockController);
transactionRoutes.post("/sell", requireAuth, sellStockController);
// Tambahkan import getStockTransactionsController di atas
transactionRoutes.get("/portfolio/:portfolioId/stock/:ticker", requireAuth, getStockTransactionsController);

export default transactionRoutes;
