import express from "express";
import { imageAnalyzer } from "../controllers/ocean.controllers.js";
import multer from "multer";
import path from "node:path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },
    filename: (req, file, cb) => {
        cb(
            null,
            file.fieldname + "_" + Date.now() + path.extname(file.originalname)
        );
    },
});

const upload = multer({
    storage: storage,
}).single("file");

const router = express.Router();
router.post("/analyze", (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            console.error("Upload error:", err);
            return res.status(500).json(err);
        }

        if (!req.file) {
            console.error("No file uploaded");
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = req.file.path;
        console.log("image file path ", filePath);

        // Call imageAnalyzer here, after the upload is complete
        imageAnalyzer(req, res, next, filePath);
    });
});

export default router;