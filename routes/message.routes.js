import express from "express";
import { sendMessage, getMessage, getLastMessage, sendNewMessage} from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/send/:id", protectRoute, sendMessage);
router.post("/send", protectRoute, sendNewMessage);
router.get("/lastmessage", protectRoute, getLastMessage);
router.get("/:id", protectRoute, getMessage);

export default router;