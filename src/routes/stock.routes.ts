import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getStocksController } from "../controllers/stock.controller.js";

const stockRoutes = express.Router();

// Rute untuk mendapatkan daftar semua saham
stockRoutes.get("/", requireAuth, getStocksController);

export default stockRoutes;
