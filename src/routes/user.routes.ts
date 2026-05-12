import express from "express";
import {
  getDashboardController,
  loginController,
  registerController,
} from "../controllers/user.controller.js";
import { AuthRequest, requireAuth } from "../middleware/auth.middleware.js";

const userRoutes = express.Router();

// route public
userRoutes.post("/register", registerController);
userRoutes.post("/login", loginController);

// route jwt token
userRoutes.get("/profile", requireAuth, (req: AuthRequest, res) => {
  res.status(500).json({
    success: true,
    message: "Selamat datang di area privat",
    user_token: req.user,
  });
});

userRoutes.get("/dashboard", requireAuth, getDashboardController);

export default userRoutes;
