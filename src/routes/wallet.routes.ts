// Di dalam src/routes/wallet.routes.ts
import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { topUpWallet } from "../controllers/wallet.controller.js";

const walletRouter = Router();

// Endpoint ini akan menjadi /api/wallets/topup nantinya
walletRouter.post("/topup", requireAuth, topUpWallet);

export default walletRouter;
