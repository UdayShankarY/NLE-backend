import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";

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
import addonRoutes from "./routes/addonRoutes";
import activityRoutes from "./routes/activityRoutes";
import catalogRoutes from "./routes/catalogRoutes";
import orderRoutes from "./routes/orderRoutes";
import { initializeAI } from "./src/ai";
import Product from "./models/Product";

const app = express();
const frontendRootPath = path.resolve(__dirname, "../frontend");
const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
const frontendIndexPath = path.join(frontendDistPath, "index.html");
const frontendSourceIndexPath = path.join(frontendRootPath, "index.html");
const defaultSeoDescription = "Premium surprise and decoration experiences curated for every celebration.";

const escapeHtml = (value: string) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getIndexTemplatePath = () => {
  if (fs.existsSync(frontendSourceIndexPath)) {
    return frontendSourceIndexPath;
  }

  if (fs.existsSync(frontendIndexPath)) {
    return frontendIndexPath;
  }

  return frontendSourceIndexPath;
};

const buildSeoTemplate = (req: Request, product: any | null) => {
  const baseUrl = process.env.FRONTEND_URL || process.env.PUBLIC_URL || "https://thedecorparty.com";
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  const productId = product?._id ? String(product._id) : "";
  const requestUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const canonicalUrl = productId ? `${normalizedBaseUrl}/product/${productId}` : requestUrl;
  const title = product?.name || "TheDecorParty";
  const description = product?.description || defaultSeoDescription;
  const image = product?.image || `${normalizedBaseUrl}/og-default.jpg`;

  return {
    title: escapeHtml(title),
    description: escapeHtml(description),
    image: escapeHtml(image),
    url: escapeHtml(canonicalUrl),
  };
};

const renderFrontendShell = async (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }

  if (req.path.startsWith("/assets/") || req.path.includes(".")) {
    return next();
  }

  const indexPath = getIndexTemplatePath();

  if (!fs.existsSync(indexPath)) {
    return next();
  }

  let product: any | null = null;

  if (req.path.startsWith("/product/")) {
    const productId = (req.params as Record<string, string | undefined>).productId || req.path.split("/").filter(Boolean)[1];
    if (productId) {
      try {
        product = await Product.findById(productId).lean();
      } catch (error) {
        console.error("Product SEO lookup failed", error);
      }
    }
  }

  const html = fs.readFileSync(indexPath, "utf8");
  const seo = buildSeoTemplate(req, product);
  console.log("SEO index path", indexPath);
  console.log("SEO placeholders present", html.includes("__OG_TITLE__"));
  const updatedHtml = html
    .replace(/__OG_TITLE__/g, seo.title)
    .replace(/__OG_DESCRIPTION__/g, seo.description)
    .replace(/__OG_IMAGE__/g, seo.image)
    .replace(/__OG_URL__/g, seo.url);

  return res.type("html").send(updatedHtml);
};

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
app.use("/api/addons", addonRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/orders", orderRoutes);

app.use((req, res, next) => {
  if (req.method === "GET" && /^\/product\/[^/]+\/?$/.test(req.path)) {
    return renderFrontendShell(req, res, next);
  }

  next();
});

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
}

app.get("/product/:productId", (req, res, next) => {
  return renderFrontendShell(req, res, next);
});
app.get("/:path", renderFrontendShell);

const port = Number(process.env.PORT || 5000);

start().then(() => {
  app.listen(port, async () => {
    console.log("Server running on port", port);
    await initializeAI();
  });
});
