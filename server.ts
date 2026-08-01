import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import sliderRoutes from "./routes/sliderRoutes";
import siteContentRoutes from "./routes/siteContentRoutes";
import adminRoutes from "./routes/adminRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import aiRoutes from "./routes/ai.routes";
import wishlistRoutes from "./routes/wishlistRoutes";
import { initializeAI } from "./src/ai";

const app = express();
app.use((req, res, next) => {
  console.log("➡️", req.method, req.originalUrl);
  next();
});
app.use(cors());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

// Connect to MongoDB before starting the HTTP server.
// Use a short serverSelectionTimeoutMS so failures surface quickly and
// set `bufferCommands: false` so queries fail fast instead of buffering.
async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "", {
      serverSelectionTimeoutMS: 5000,
      // disable command buffering so we get immediate errors when DB is unavailable
      bufferCommands: false,
    } as mongoose.ConnectOptions);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Error:", err);
    // Exit early - the app cannot function without DB
    process.exit(1);
  }
}

app.get("/", (_req, res) => {
  console.log("🔥 ROOT ROUTE HIT");

  res.send("THIS IS MY NEW SERVER");
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/sliders", sliderRoutes);
app.use("/api/site-content", siteContentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/wishlist", wishlistRoutes);

const port = Number(process.env.PORT || 5000);

start().then(() => {
  app.listen(port, async () => {
    console.log("Server running on port", port);
    await initializeAI();
  });
});
