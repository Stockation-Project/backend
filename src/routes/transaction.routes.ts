import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { buyStockController } from "../controllers/transaction.controller.js";

const transactionRoutes = express.Router();

transactionRoutes.post("/buy", requireAuth, buyStockController);

export default transactionRoutes;
