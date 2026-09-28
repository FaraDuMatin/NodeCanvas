import fs from "node:fs";
import path from "node:path";
import express, { Router } from "express";
import multer from "multer";
import { newId } from "@node-canvas/graph";
import { config } from "../config";
import { requireToken } from "./requireToken";

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = /^image\/(png|jpe?g|gif|webp|svg\+xml|avif)$/;

const storage = multer.diskStorage({
  destination: config.uploadsDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, "");
    cb(null, `${newId()}${ext || ".bin"}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
  fileFilter: (_req, file, cb) => cb(null, ALLOWED.test(file.mimetype)),
});

/** POST /upload (multipart field "file") and static GET /uploads/*. */
export function createUploadRouter(): Router {
  fs.mkdirSync(config.uploadsDir, { recursive: true });
  const router = Router();

  router.post("/upload", requireToken, upload.single("file"), (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "Expected an image in field 'file'" });
      return;
    }
    res.json({ url: `${config.publicUrl}/uploads/${req.file.filename}` });
  });

  router.use("/uploads", express.static(config.uploadsDir, { maxAge: "1y", immutable: true }));
  return router;
}
