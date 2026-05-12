import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  buyStockController,
  sellStockController,
} from "../controllers/transaction.controller.js";

const transactionRoutes = express.Router();

transactionRoutes.post("/buy", requireAuth, buyStockController);
transactionRoutes.post("/sell", requireAuth, sellStockController);

export default transactionRoutes;
