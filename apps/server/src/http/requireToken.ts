import type { RequestHandler } from "express";
import { config } from "../config";

/** Checks `Authorization: Bearer <token>` when AUTH_TOKEN is set. No-op otherwise. */
export const requireToken: RequestHandler = (req, res, next) => {
  if (!config.authToken) return next();
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (token === config.authToken) return next();
  res.status(401).json({ error: "Unauthorized" });
};
