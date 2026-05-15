import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  topUpWallet,
  allocateFunds,
  withdrawFunds,
  getUserWallet,
} from "../controllers/wallet.controller.js";
import { getActivityHistory } from "../controllers/activity.controller.js";

const walletRouter = Router();

// Endpoints: /api/wallets/...
walletRouter.get("/", requireAuth, getUserWallet);
walletRouter.post("/topup", requireAuth, topUpWallet);
walletRouter.post("/allocate", requireAuth, allocateFunds);
walletRouter.post("/withdraw", requireAuth, withdrawFunds);
walletRouter.get("/history", requireAuth, getActivityHistory);

export default walletRouter;
