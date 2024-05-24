import express from "express";
import { loginUser, logoutUser, signupUser } from "../controllers/auth.controllers.js";

const router = express.Router();

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.post("/signup", signupUser);

export default router;