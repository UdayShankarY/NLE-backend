const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Slider = require('../models/Slider');

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      activeProducts,
      totalCategories,
      totalSliders,
      recentUsers,
      topProducts,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments(),
      Product.countDocuments({ active: true }),
      Category.countDocuments({ active: true }),
      Slider.countDocuments({ active: true }),
      User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('firstName lastName email createdAt'),
      Product.find({ active: true }).sort({ orderCount: -1 }).limit(5).select('name categoryName price orderCount image'),
    ]);

    res.json({
      totalUsers,
      totalProducts,
      activeProducts,
      totalCategories,
      totalSliders,
      recentUsers,
      topProducts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/users — all users and admins
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('firstName lastName email role createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
