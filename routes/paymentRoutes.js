const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config(); // 🔥 load env

// 🔥 Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ===============================
// ✅ CREATE ORDER
// ===============================
router.post('/create-order', async (req, res) => {
  try {
    console.log("🔥 HIT CREATE ORDER");
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const options = {
      amount: amount * 100, // 🔥 convert ₹ → paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    // Check if using placeholder/invalid keys
    const hasValidKeys = process.env.RAZORPAY_KEY_ID && 
                         !process.env.RAZORPAY_KEY_ID.includes('x') &&
                         process.env.RAZORPAY_KEY_SECRET &&
                         !process.env.RAZORPAY_KEY_SECRET.includes('x');

    if (!hasValidKeys) {
      console.log("⚠️  Using mock order response (invalid Razorpay keys)");
      // Return mock order for frontend testing
      const mockOrder = {
        id: `order_${Date.now()}`,
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        status: "created"
      };
      return res.json(mockOrder);
    }

    const order = await razorpay.orders.create(options);
    console.log("✅ Order created:", order);
    res.json(order);
  } catch (err) {
    console.error("❌ Razorpay Error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ===============================
// ✅ VERIFY PAYMENT
// ===============================
router.post('/verify', (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      console.log("✅ Payment Verified");
      res.json({ success: true });
    } else {
      console.log("❌ Invalid Signature");
      res.status(400).json({ success: false });
    }

  } catch (err) {
    console.error("❌ Verify Error:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;