import express, { Request, Response } from "express";
import Order from "../models/Order";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      productId,
      productName,
      categoryName,
      subcategory,
      packagePrice,
      amount,
      paymentMethod,
      paymentStatus,
      bookingDetails,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    if (!productId || !productName || !categoryName || !packagePrice || !amount || !bookingDetails?.length) {
      return res.status(400).json({ error: "Missing required booking information." });
    }

    const order = new Order({
      productId,
      productName,
      categoryName,
      subcategory,
      packagePrice,
      amount,
      paymentMethod,
      paymentStatus,
      bookingDetails,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    await order.save();
    res.status(201).json(order);
  } catch (err: unknown) {
    console.error("Order creation failed:", err);
    const message = err instanceof Error ? err.message : "Unable to create the booking order.";
    res.status(500).json({ error: message });
  }
});

router.get("/", async (_req: Request, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unable to fetch orders.";
    res.status(500).json({ error: message });
  }
});

export default router;
