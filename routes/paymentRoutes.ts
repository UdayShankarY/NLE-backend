import express, { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import axios from "axios";
import "dotenv/config";
import Order from "../models/Order";

const router = express.Router();

/**
 * Validate Razorpay configuration
 */
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ Razorpay keys are missing from environment variables.");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

/**
 * Create Razorpay Order
 */
router.post("/create-order", async (req: Request, res: Response) => {
  try {
    const { amount, receipt, notes } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Razorpay keys are not configured.",
      });
    }

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    };

    console.log("========== Creating Razorpay Order ==========");
    console.log("Options:", options);

    const order = await razorpay.orders.create(options);

    console.log("========== Razorpay Order Created ==========");
    console.log(order);

    return res.status(200).json(order);
  } catch (error: any) {
    console.error("========== Razorpay Create Order Error ==========");
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        error?.error?.description ||
        error?.message ||
        "Unable to create order",
      error,
    });
  }
});

/**
 * Verify Payment
 */
router.post("/verify", async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderPayload,
    } = req.body;

    console.log("[payment] verify request", {
      razorpay_order_id,
      razorpay_payment_id,
      hasOrderPayload: Boolean(orderPayload),
    });

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification fields",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    if (razorpay_payment_id) {
      const existingOrder = await Order.findOne({
        razorpayPaymentId: razorpay_payment_id,
      });

      if (existingOrder) {
        return res.status(200).json({
          success: true,
          message: "Payment verified successfully",
          order: existingOrder,
        });
      }
    }

    if (orderPayload) {
      const payload = {
        ...orderPayload,
        paymentStatus: "paid",
        paymentMethod: "razorpay",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      };

      console.log("[payment] saving verified order payload", payload);

      const order = new Order(payload);
      await order.save();

      console.log("[payment] verified order saved", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        userId: order.userId,
      });

      // =============================
      // Send booking to n8n
      // =============================
      try {
  await axios.post(process.env.N8N_WEBHOOK_URL!,
  {
    orderNumber: order.orderNumber,
    orderId: order._id,

    // ✅ ADD THIS
    customer: order.customer,

    productId: order.productId,
    productName: order.productName,
    categoryName: order.categoryName,
    subcategory: order.subcategory,

    packagePrice: order.packagePrice,
    amount: order.amount,

    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,

    bookingDetails: order.bookingDetails,

    addons: order.addons,
    activities: order.activities,

    razorpayOrderId: order.razorpayOrderId,
    razorpayPaymentId: order.razorpayPaymentId,
    razorpaySignature: order.razorpaySignature,

    createdAt: order.createdAt,
  }
);

  console.log("✅ Booking sent to n8n");
} catch (err: any) {
  console.error("❌ Failed to send booking to n8n");
  console.error(err?.response?.data || err.message);
}
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        order,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error: any) {
    console.error("========== Razorpay Verify Error ==========");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Payment verification failed",
    });
  }
});

export default router;