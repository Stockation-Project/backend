import express from "express";
import { registerController } from "../controllers/user.controller.js";

const userRoutes = express.Router();

userRoutes.post("/register", registerController);

export default userRoutes;
