import express from "express";
import {
  getDashboardController,
  getUserProfileController,
  updateUserProfileController,
  loginController,
  registerController,
  googleSyncController,
  uploadAvatarController,
} from "../controllers/user.controller.js";
import { AuthRequest, requireAuth } from "../middleware/auth.middleware.js";

const userRoutes = express.Router();

// route public
userRoutes.post("/register", registerController);
userRoutes.post("/login", loginController);
userRoutes.post("/google-sync", googleSyncController);

// route jwt token
userRoutes.get("/profile", requireAuth, getUserProfileController);
userRoutes.put("/profile", requireAuth, updateUserProfileController);
userRoutes.post("/profile/avatar", requireAuth, uploadAvatarController);

userRoutes.get("/dashboard", requireAuth, getDashboardController);

export default userRoutes;
