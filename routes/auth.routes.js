import express from "express";
import { findUser, loginUser, logoutUser, signupUser, verifyEmail } from "../controllers/auth.controllers.js";

const router = express.Router();

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.post("/signup", signupUser);

router.get("/verify-email", verifyEmail);

router.get("/finduser", findUser);

export default router;