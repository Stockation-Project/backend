import { Request, Response, NextFunction, response } from "express";
import supabase from "../config/supabase.js";

// karna pakai typescript jadi butuh properti
export interface AuthRequest extends Request {
  user?: any;
  token?: string;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // cek user punya toket ga
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Akses ditolak. Tiket tidak ditemukan atau format salah.",
      });
      return;
    }

    // ambil token nya aja
    const token = authHeader.split(" ")[1];

    // minta supabase buat validasi
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({
        success: false,
        message: "Tiket tidak valid atau sudah kadaluarsa.",
      });
      return;
    }

    // kalo tiketnya asli simpen ke Request
    req.user = data.user;
    req.token = token;

    next();
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};
