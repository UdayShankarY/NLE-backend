import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ msg: "No token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

    (req as Request & { user?: unknown }).user = decoded;

    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
}
