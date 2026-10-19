
const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/authorizeAdmin");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// All products: logged-in users
router.get("/", authenticateToken, getProducts);

// One product: logged-in users
router.get("/:id", authenticateToken, getProductById);

// Create: admin only
router.post("/", authenticateToken, authorizeAdmin, createProduct);

// Update: admin only
router.put("/:id", authenticateToken, authorizeAdmin, updateProduct);

// Delete: admin only
router.delete("/:id", authenticateToken, authorizeAdmin, deleteProduct);

module.exports = router;
