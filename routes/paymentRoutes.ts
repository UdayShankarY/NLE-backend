import express, { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import "dotenv/config";

const router = express.Router();
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/create-order", async (req: Request, res: Response) => {
  try {
    const { amount, receipt, notes } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    };

    const hasValidKeys =
      typeof process.env.RAZORPAY_KEY_ID === "string" &&
      process.env.RAZORPAY_KEY_ID.trim().length > 0 &&
      !process.env.RAZORPAY_KEY_ID.includes("x") &&
      typeof process.env.RAZORPAY_KEY_SECRET === "string" &&
      process.env.RAZORPAY_KEY_SECRET.trim().length > 0 &&
      !process.env.RAZORPAY_KEY_SECRET.includes("x");

    if (!hasValidKeys) {
      const mockOrder = {
        id: `order_${Date.now()}`,
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        status: "created",
      };
      return res.json(mockOrder);
    }

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/verify", (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
