import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { submitQuestionnaireController } from "../controllers/questionnaire.controller.js";

const questionnaireRouter = express.Router();

questionnaireRouter.post("/submit", requireAuth, submitQuestionnaireController);

export default questionnaireRouter;
