import express, { Request, Response } from "express";
import Product from "../models/Product";
import { aiReindexService } from "../src/ai/services/ai-reindex.service";

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ orderCount: -1, createdAt: -1 });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/order", async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { orderCount: 1 } },
      { new: true }
    );
    res.json({ orderCount: product?.orderCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/category/:categoryId", async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ categoryId: req.params.categoryId });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const product = new Product(req.body);
    await product.save();
    aiReindexService.scheduleReindex();
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updated) {
      aiReindexService.scheduleReindex();
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (deleted) {
      aiReindexService.scheduleReindex();
    }
    res.json({ message: "Product deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
