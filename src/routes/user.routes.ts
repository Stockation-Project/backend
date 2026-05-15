import express from "express";
import {
  getDashboardController,
  getUserProfileController,
  updateUserProfileController,
  loginController,
  registerController,
} from "../controllers/user.controller.js";
import { AuthRequest, requireAuth } from "../middleware/auth.middleware.js";

const userRoutes = express.Router();

// route public
userRoutes.post("/register", registerController);
userRoutes.post("/login", loginController);

// route jwt token
userRoutes.get("/profile", requireAuth, getUserProfileController);
userRoutes.put("/profile", requireAuth, updateUserProfileController);

userRoutes.get("/dashboard", requireAuth, getDashboardController);

export default userRoutes;
