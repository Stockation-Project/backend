import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { getUnifiedHistoryService } from "../services/activity.service.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";

export const getActivityHistory = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Akses ditolak", 401);

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
});
