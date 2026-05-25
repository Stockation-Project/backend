import { Router } from "express";
import { explainTerm } from "../controllers/ai.controller.js";

const router = Router();

// Endpoint: GET /api/ai/explanation?term=CAGR
router.get("/explanation", explainTerm);

export default router;
