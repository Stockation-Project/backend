import { Request, Response } from "express";
import { explainTermService } from "../services/ai.service.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";

export const explainTerm = catchAsync(async (req: Request, res: Response) => {
  const { term, context } = req.query;

  if (!term || typeof term !== "string") {
    throw new AppError("Parameter 'term' harus disertakan dan berupa string", 400);
  }

  const contextStr = typeof context === "string" ? context : undefined;
  const explanation = await explainTermService(term, contextStr);

  res.status(200).json({
    success: true,
    data: explanation,
    message: "Berhasil mendapatkan penjelasan",
  });
});
