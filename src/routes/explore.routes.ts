import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  getMarketMoversController,
  getWatchlistController,
  toggleWatchlistController
} from "../controllers/explore.controller.js";

const exploreRoutes = express.Router();

// Semua rute di sini memerlukan autentikasi
exploreRoutes.use(requireAuth);

exploreRoutes.get("/market-movers", getMarketMoversController);
exploreRoutes.get("/watchlist", getWatchlistController);
exploreRoutes.post("/watchlist/toggle", toggleWatchlistController);

export default exploreRoutes;
