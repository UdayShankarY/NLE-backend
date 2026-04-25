require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const testRoutes = require("./routes/testRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const sliderRoutes = require("./routes/sliderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const siteContentRoutes = require("./routes/siteContentRoutes");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",              // for local testing
    "https://nle-frontend.vercel.app"     // your deployed frontend
  ]
}));
// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server working");
});

// Routes
app.use("/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sliders", sliderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/site-content", siteContentRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
