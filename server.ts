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

interface ProductShareData {
  _id?: string;
  name?: string;
  description?: string;
  image?: string;
}

console.log("===== SHARE ROUTE BUILD v2 =====");

const backendRootPath = fs.existsSync(path.join(__dirname, "server.ts")) ? __dirname : path.resolve(__dirname, "..");
const candidateFrontendRoots = [
  path.resolve(backendRootPath, "frontend"),
  path.resolve(backendRootPath, "dist", "frontend"),
  path.resolve(__dirname, "..", "frontend"),
  path.resolve(__dirname, "..", "dist", "frontend"),
  path.resolve(__dirname, "..", "..", "frontend"),
  path.resolve(__dirname, "..", "..", "backend", "frontend"),
].filter((value, index, array) => array.indexOf(value) === index);
const frontendRootPath = candidateFrontendRoots.find((candidate) => fs.existsSync(path.join(candidate, "index.html"))) || candidateFrontendRoots[0] || path.resolve(backendRootPath, "frontend");
const frontendDistPath = path.join(frontendRootPath, "dist");
const frontendIndexPath = path.join(frontendDistPath, "index.html");
const frontendSourceIndexPath = path.join(frontendRootPath, "index.html");
const defaultSeoDescription = "Premium surprise and decoration experiences curated for every celebration.";

const logSeoPaths = () => {
  console.log("[SEO] backendRootPath", backendRootPath);
  console.log("[SEO] frontendRootPath", frontendRootPath);
  console.log("[SEO] frontendDistPath", frontendDistPath);
  console.log("[SEO] frontendIndexPath", frontendIndexPath, "exists=", fs.existsSync(frontendIndexPath));
  console.log("[SEO] frontendSourceIndexPath", frontendSourceIndexPath, "exists=", fs.existsSync(frontendSourceIndexPath));
};

const escapeHtml = (value: string) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildProductSharePage = (req: Request, product: ProductShareData | null) => {
  const baseUrl = process.env.FRONTEND_URL || process.env.PUBLIC_URL || "https://www.thedecorparty.com";
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  const productId = product?._id ? String(product._id) : "";
  const productUrl = productId ? `${normalizedBaseUrl}/product/${productId}` : `${normalizedBaseUrl}/products`;
  const title = product?.name || "TheDecorParty";
  const description = product?.description || defaultSeoDescription;
  const image = product?.image || `${normalizedBaseUrl}/og-default.jpg`;

  const escapedTitle = escapeHtml(title);
  const escapedDescription = escapeHtml(description);
  const escapedImage = escapeHtml(image);
  const escapedUrl = escapeHtml(productUrl);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDescription}" />
    <meta property="og:title" content="${escapedTitle}" />
    <meta property="og:description" content="${escapedDescription}" />
    <meta property="og:image" content="${escapedImage}" />
    <meta property="og:url" content="${escapedUrl}" />
    <meta property="og:type" content="product" />
    <meta property="og:site_name" content="TheDecorParty" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapedTitle}" />
    <meta name="twitter:description" content="${escapedDescription}" />
    <meta name="twitter:image" content="${escapedImage}" />
    <link rel="canonical" href="${escapedUrl}" />
    <meta http-equiv="refresh" content="1;url=${escapedUrl}" />
    <script>
      window.location.replace(${JSON.stringify(productUrl)});
    </script>
  </head>
  <body>
    Redirecting to product...
  </body>
</html>`;
};

const getIndexTemplatePath = () => {
  if (fs.existsSync(frontendIndexPath)) {
    return frontendIndexPath;
  }

  if (fs.existsSync(frontendSourceIndexPath)) {
    return frontendSourceIndexPath;
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

const injectSeoTagsIntoHtml = (html: string, seo: ReturnType<typeof buildSeoTemplate>) => {
  const hasPlaceholders = html.includes("__OG_TITLE__") || html.includes("__OG_DESCRIPTION__") || html.includes("__OG_IMAGE__") || html.includes("__OG_URL__");

  if (hasPlaceholders) {
    return html
      .replace(/__OG_TITLE__/g, seo.title)
      .replace(/__OG_DESCRIPTION__/g, seo.description)
      .replace(/__OG_IMAGE__/g, seo.image)
      .replace(/__OG_URL__/g, seo.url);
  }

  const headInjection = `
    <title>${seo.title}</title>
    <meta name="description" content="${seo.description}" />
    <meta property="og:title" content="${seo.title}" />
    <meta property="og:description" content="${seo.description}" />
    <meta property="og:image" content="${seo.image}" />
    <meta property="og:url" content="${seo.url}" />
    <meta property="og:type" content="product" />
    <meta property="og:site_name" content="TheDecorParty" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${seo.title}" />
    <meta name="twitter:description" content="${seo.description}" />
    <meta name="twitter:image" content="${seo.image}" />
    <link rel="canonical" href="${seo.url}" />`;

  if (html.includes("</head>")) {
    return html.replace(/<\/head>/i, `${headInjection}\n</head>`);
  }

  return html;
};

const renderFrontendShell = async (req: Request, res: Response, next: NextFunction) => {
  console.log("[SEO] request", req.method, req.originalUrl, "path=", req.path);

  if (req.path.startsWith("/api/")) {
    console.log("[SEO] skip: api route");
    return next();
  }

  if (req.path.startsWith("/assets/") || req.path.includes(".")) {
    console.log("[SEO] skip: asset route");
    return next();
  }

  const indexPath = getIndexTemplatePath();
  console.log("[SEO] selected template", indexPath);

  if (!fs.existsSync(indexPath)) {
    console.log("[SEO] skip: template missing");
    return next();
  }

  let product: any | null = null;

  if (req.path.startsWith("/product/")) {
    const productId = (req.params as Record<string, string | undefined>).productId || req.path.split("/").filter(Boolean)[1];
    if (productId) {
      try {
        product = await Product.findById(productId).lean();
        console.log("[SEO] product lookup", productId, product ? "found" : "missing");
      } catch (error) {
        console.error("Product SEO lookup failed", error);
      }
    }
  }

  const html = fs.readFileSync(indexPath, "utf8");
  const seo = buildSeoTemplate(req, product);
  const updatedHtml = injectSeoTagsIntoHtml(html, seo);
console.log(updatedHtml.includes("__OG_TITLE__"));
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

app.get("/share/product/:productId", async (req: Request, res: Response) => {
  console.log("[SHARE] Request", req.originalUrl);

  const productId = req.params.productId;
  const product = await Product.findById(productId).lean<ProductShareData | null>();

  if (!product) {
    console.log("[SHARE] Product Missing", productId);
    res.status(404).type("html").send("<!DOCTYPE html><html><body>Product not found</body></html>");
    return;
  }

  console.log("[SHARE] Product Found", productId);
  const html = buildProductSharePage(req, product);
  console.log("[SHARE] Generated Share Page", productId);
  res.type("html").send(html);
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

app.get("/product/:productId", (req, res, next) => {
  console.log("[SEO] registered product route", req.originalUrl);
  return renderFrontendShell(req, res, next);
});

app.use((req, res, next) => {
  if (req.method === "GET" && /^\/product\/[^/]+\/?$/.test(req.path)) {
    return renderFrontendShell(req, res, next);
  }

  next();
});

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
}

app.get(/.*/, renderFrontendShell);
const port = Number(process.env.PORT || 5000);

start().then(() => {
  app.listen(port, async () => {
    console.log("Server running on port", port);
    logSeoPaths();
    await initializeAI();
  });
});
