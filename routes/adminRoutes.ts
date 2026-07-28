import express, { Request, Response } from "express";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.get("/products", authMiddleware, (req: Request, res: Response) => {
  if ((req as Request & { user?: { role?: string } }).user?.role !== "admin") {
    return res.status(403).json({ msg: "Not admin" });
  }

  res.json("Admin access granted");
});

export default router;
