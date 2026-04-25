const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET all products - sorted by orderCount desc
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ orderCount: -1, createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// INCREMENT orderCount when added to cart
router.post("/:id/order", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { orderCount: 1 } },
      { new: true }
    );
    res.json({ orderCount: product.orderCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET products by category
router.get("/category/:categoryId", async (req, res) => {
  try {
    const products = await Product.find({ categoryId: req.params.categoryId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD product
router.post("/", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE product
router.put("/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE product
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
