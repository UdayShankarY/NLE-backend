const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  categoryName: String,
  subcategory: String,
  price: {
    type: Number,
    required: true
  },
  originalPrice: Number,
  description: String,
  inclusions: [String],
  addOns: [{
    name: String,
    price: Number
  }],
  image: {
    type: String,
    required: true
  },
  moreImages: [String],
  badge: String,
  badgeColor: {
    type: String,
    enum: ["purple", "pink", "gold", "green"],
    default: "purple"
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  orderCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Product", ProductSchema);
