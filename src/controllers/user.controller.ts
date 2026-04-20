import { Request, Response } from "express";
import {
  registerUserService,
  loginUserService,
  RegisterPayload,
  LoginPayload,
  getDashboardSummaryService
} from "../services/user.service.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// menyisipkan tipe register payload tadi ke request body
export const registerController = async (
  req: Request<{}, {}, RegisterPayload>,
  res: Response,
): Promise<void> => {
  try {
    const user = await registerUserService(req.body);

    res.status(201).json({
      success: true,
      message: "Registrasi Berhasil dan Terhubung ke Supabase Auth",
      data: user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginController = async (
  req: Request<{}, {}, LoginPayload>,
  res: Response,
): Promise<void> => {
  try {
    const result = await loginUserService(req.body);

    res.status(200).json({
      success: true,
      message: "Login Berhasil",
      data: result,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDashboardController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user.id as string;
    const dashboardData = await getDashboardSummaryService(userId);

    res.status(200).json({
      success: true,
      message: "Berhasil memuat data dashboard utama",
      data: dashboardData,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
