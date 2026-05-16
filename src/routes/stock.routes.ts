import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  getStocksController,
  getStockDetailController,
  getExploreStocksController,
  getRecommendedStocksController,
  syncStocksController,
  seedStocksController,
  syncClusteringController,
} from "../controllers/stock.controller.js";

const stockRoutes = express.Router();

// Rute untuk mendapatkan daftar semua saham
stockRoutes.get("/", requireAuth, getStocksController);
stockRoutes.get("/explore", requireAuth, getExploreStocksController);
stockRoutes.get("/recommendations", requireAuth, getRecommendedStocksController);
stockRoutes.get("/detail/:ticker", requireAuth, getStockDetailController);
stockRoutes.post("/sync-metadata", syncStocksController);
stockRoutes.post("/seed-idx80", seedStocksController);
stockRoutes.post("/sync-clustering", syncClusteringController);

export default stockRoutes;
