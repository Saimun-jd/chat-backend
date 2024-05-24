import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getFriends } from "../controllers/friends.controllers.js";

const router = express.Router();
router.get("/getfriends", protectRoute, getFriends);

export default router;