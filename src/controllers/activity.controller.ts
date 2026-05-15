import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { getUnifiedHistoryService } from "../services/activity.service.js";

export const getActivityHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Akses ditolak");

    const { portfolio_id, filter } = req.query;

    const history = await getUnifiedHistoryService(
      userId,
      portfolio_id as string,
      filter as string
    );

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
