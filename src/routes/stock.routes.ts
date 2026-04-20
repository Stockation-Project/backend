import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  getStocksController,
  getStockDetailController,
  getExploreStocksController,
  getRecommendedStocksController,
} from "../controllers/stock.controller.js";

const stockRoutes = express.Router();

// Rute untuk mendapatkan daftar semua saham
stockRoutes.get("/", requireAuth, getStocksController);
stockRoutes.get("/explore", requireAuth, getExploreStocksController);
stockRoutes.get("/recommendations", requireAuth, getRecommendedStocksController);
stockRoutes.get("/detail/:ticker", requireAuth, getStockDetailController);

export default stockRoutes;
