const mongoose = require("mongoose");

const BookingAddonSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  qty: {
    type: Number,
    default: 1,
  },
  kind: {
    type: String,
    enum: ["addon", "activity"],
  },
}, { _id: false });

const BookingDetailsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  eventDate: {
    type: String,
    required: true,
    trim: true,
  },
  eventTime: {
    type: String,
    required: true,
    trim: true,
  },
  requests: {
    type: String,
    trim: true,
    default: "",
  },
  addOns: {
    type: [BookingAddonSchema],
    default: [],
  },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  categoryName: {
    type: String,
    required: true,
    trim: true,
  },
  subcategory: {
    type: String,
    trim: true,
    default: "",
  },
  packagePrice: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["razorpay", "whatsapp"],
    default: "whatsapp",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "cancelled"],
    default: "pending",
  },
  bookingDetails: {
    type: [BookingDetailsSchema],
    default: [],
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model("Order", OrderSchema);
