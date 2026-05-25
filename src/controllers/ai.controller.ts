import { Request, Response } from "express";
import { explainTermService } from "../services/ai.service.js";

export const explainTerm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { term, context } = req.query;

    if (!term || typeof term !== "string") {
      res.status(400).json({
        success: false,
        message: "Parameter 'term' harus disertakan dan berupa string",
      });
      return;
    }

    const contextStr = typeof context === "string" ? context : undefined;
    const explanation = await explainTermService(term, contextStr);

    res.status(200).json({
      success: true,
      data: explanation,
      message: "Berhasil mendapatkan penjelasan",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan pada server",
    });
  }
};
