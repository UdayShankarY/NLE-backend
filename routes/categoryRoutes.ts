import express, { Request, Response } from "express";
import Category from "../models/Category";
import Product from "../models/Product";
import { aiReindexService } from "../src/ai/services/ai-reindex.service";

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find().lean();
    const counts = await Product.aggregate([
      { $group: { _id: "$categoryId", count: { $sum: 1 } } }
    ]);
    const countMap = new Map(counts.map((item: any) => [String(item._id), item.count]));
    const categoriesWithCounts = categories.map((category: any) => ({
      ...category,
      productCount: countMap.get(String(category._id)) || 0,
    }));
    res.json(categoriesWithCounts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const existing = await Category.findOne({ name });

    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new Category(req.body);
    await category.save();
    aiReindexService.scheduleReindex();

    res.json(category);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (deleted) {
      aiReindexService.scheduleReindex();
    }
    res.json({ message: "Category deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
