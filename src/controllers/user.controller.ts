import { Request, Response } from "express";
import {
  registerUserService,
  loginUserService,
  googleSyncService,
  RegisterPayload,
  LoginPayload,
  GoogleSyncPayload,
  getDashboardSummaryService,
  getUserProfileService,
  updateUserProfileService,
  uploadAvatarService
} from "../services/user.service.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";

// menyisipkan tipe register payload tadi ke request body
export const registerController = catchAsync(async (
  req: Request<{}, {}, RegisterPayload>,
  res: Response,
) => {
  const user = await registerUserService(req.body);

  res.status(201).json({
    success: true,
    message: "Registrasi Berhasil dan Terhubung ke Supabase Auth",
    data: user,
  });
});

export const loginController = catchAsync(async (
  req: Request<{}, {}, LoginPayload>,
  res: Response,
) => {
  const result = await loginUserService(req.body);

  res.status(200).json({
    success: true,
    message: "Login Berhasil",
    data: result,
  });
});

export const googleSyncController = catchAsync(async (
  req: Request<{}, {}, GoogleSyncPayload>,
  res: Response,
) => {
  const result = await googleSyncService(req.body);

  res.status(200).json({
    success: true,
    message: "Sinkronisasi Google Auth Berhasil",
    data: result,
  });
});

export const getDashboardController = catchAsync(async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user.id as string;
  const dashboardData = await getDashboardSummaryService(userId);

  res.status(200).json({
    success: true,
    message: "Berhasil memuat data dashboard utama",
    data: dashboardData,
  });
});

export const getUserProfileController = catchAsync(async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user.id as string;
  const user = await getUserProfileService(userId);

  res.status(200).json({
    success: true,
    message: "Berhasil mengambil data profil",
    data: user,
  });
});

export const updateUserProfileController = catchAsync(async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user.id as string;
  const updates = req.body;
  const user = await updateUserProfileService(userId, updates);

  res.status(200).json({
    success: true,
    message: "Berhasil memperbarui profil",
    data: user,
  });
});

export const uploadAvatarController = catchAsync(async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user.id as string;
  const { image } = req.body;

  if (!image) {
    throw new AppError("File gambar tidak ditemukan", 400);
  }

  const user = await uploadAvatarService(userId, image, req.token as string);

  res.status(200).json({
    success: true,
    message: "Berhasil memperbarui foto profil",
    data: user,
  });
});
