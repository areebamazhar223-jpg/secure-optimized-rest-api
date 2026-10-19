
require("dotenv").config();

const express = require("express");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

// Database connection
require("./database");

// Import routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();
// Import cache functions
const { clearCache } = require("./cache");

// 1. Security headers
app.use(helmet());

// 2. Compress responses
app.use(compression());

// 3. Parse JSON request bodies
app.use(express.json({ limit: "10kb" }));

// 4. Parse cookies
app.use(cookieParser());

// 5. Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  })
);

// 6. Request logging
app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} ${req.method} ${req.originalUrl}`
  );
  next();
});

// 7. Health-check API
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Secure Backend API is running!",
  });
});

// 8. Authentication routes
app.use("/api/auth", authRoutes);

// 9. Product routes
app.use("/api/products", productRoutes);

// 10. Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// 11. Central error handler
app.use((err, req, res, next) => {
  console.error("API Error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// 12. Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
