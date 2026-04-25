const express = require("express");
const router = express.Router();
const Slider = require("../models/Slider");

// GET all sliders (sorted by order)
router.get("/", async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ order: 1 });
    res.json(sliders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD slider
router.post("/", async (req, res) => {
  try {
    // Get the highest order number and add 1
    const maxOrder = await Slider.findOne().sort({ order: -1 }).select("order");
    const newOrder = maxOrder ? maxOrder.order + 1 : 0;
    
    const slider = new Slider({
      ...req.body,
      order: newOrder
    });
    await slider.save();
    res.json(slider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE slider
router.put("/:id", async (req, res) => {
  try {
    const updated = await Slider.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// REORDER sliders
router.put("/reorder/all", async (req, res) => {
  try {
    const { sliders } = req.body; // Array of { id, order }
    
    const updatePromises = sliders.map((item) =>
      Slider.findByIdAndUpdate(item.id, { order: item.order })
    );
    
    await Promise.all(updatePromises);
    const updated = await Slider.find().sort({ order: 1 });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE slider
router.delete("/:id", async (req, res) => {
  try {
    await Slider.findByIdAndDelete(req.params.id);
    res.json({ message: "Slider deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
