import { AuthRequest } from "../middleware/auth.middleware.js";
import { Response } from "express";
import {
  processQuestionnaireService,
  QuestionnairePayload,
} from "../services/questionnaire.service.js";

export const submitQuestionnaireController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // req.user.id ini dapet otomatis dari middleware
    const userId = req.user.id;

    const result = await processQuestionnaireService(
      userId,
      req.body as QuestionnairePayload,
    );

    res.status(200).json({
      success: true,
      message:
        "Kuesioner berhasil diproses, Profile Risiko dan Wallet 100jt aktif",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: true,
      message: error.message,
    });
  }
};
