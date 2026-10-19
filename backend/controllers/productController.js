
const db = require("../database");
const { getCache, setCache, clearCache } = require("../cache");

// 1. Create a new product
const createProduct = (req, res, next) => {
  try {
    const { name, price } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Product name must be 1–100 characters",
      });
    }

    if (
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid non-negative price is required",
      });
    }

    const result = db
      .prepare("INSERT INTO products (name, price) VALUES (?, ?)")
      .run(name.trim(), Number(price));

    const product = db
      .prepare(
        `SELECT id, name, price, created_at
         FROM products WHERE id = ?`
      )
      .get(result.lastInsertRowid);

    // Clear cached product lists after creation
    clearCache();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get products with pagination and caching
const getProducts = (req, res, next) => {
  try {
    const requestedPage = Number(req.query.page ?? 1);
    const requestedLimit = Number(req.query.limit ?? 10);

    if (
      !Number.isSafeInteger(requestedPage) ||
      requestedPage < 1 ||
      !Number.isSafeInteger(requestedLimit) ||
      requestedLimit < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Page and limit must be positive integers",
      });
    }

    const page = requestedPage;
    const limit = Math.min(requestedLimit, 50);
    const offset = (page - 1) * limit;

    if (!Number.isSafeInteger(offset)) {
      return res.status(400).json({
        success: false,
        message: "Requested page is too large",
      });
    }

    // Each page/limit combination gets its own cache entry
    const cacheKey = `products:page=${page}:limit=${limit}`;
    const cachedData = getCache(cacheKey);

    if (cachedData !== null) {
      return res
        .status(200)
        .set("X-Cache", "HIT")
        .json(cachedData);
    }

    const totalResult = db
      .prepare("SELECT COUNT(*) AS total FROM products")
      .get();

    const total = totalResult.total;
    const totalPages = Math.ceil(total / limit);

    const products = db
      .prepare(
        `SELECT id, name, price, created_at
         FROM products
         ORDER BY id DESC
         LIMIT ? OFFSET ?`
      )
      .all(limit, offset);

    const responseData = {
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      count: products.length,
      products,
    };

    setCache(cacheKey, responseData);

    return res
      .status(200)
      .set("X-Cache", "MISS")
      .json(responseData);
  } catch (error) {
    next(error);
  }
};

// 3. Get a single product by ID
const getProductById = (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = db
      .prepare(
        `SELECT id, name, price, created_at
         FROM products WHERE id = ?`
      )
      .get(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// 4. Update a product
const updateProduct = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, price } = req.body;

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (name === undefined && price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide a name or price to update",
      });
    }

    if (
      name !== undefined &&
      (
        typeof name !== "string" ||
        !name.trim() ||
        name.trim().length > 100
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Name must be 1–100 characters",
      });
    }

    if (
      price !== undefined &&
      (
        price === null ||
        price === "" ||
        !Number.isFinite(Number(price)) ||
        Number(price) < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be a non-negative number",
      });
    }

    const currentProduct = db
      .prepare("SELECT id, name, price FROM products WHERE id = ?")
      .get(id);

    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updatedName =
      name !== undefined ? name.trim() : currentProduct.name;

    const updatedPrice =
      price !== undefined ? Number(price) : currentProduct.price;

    db.prepare(
      "UPDATE products SET name = ?, price = ? WHERE id = ?"
    ).run(updatedName, updatedPrice, id);

    const product = db
      .prepare(
        `SELECT id, name, price, created_at
         FROM products WHERE id = ?`
      )
      .get(id);

    // Clear cached product lists after update
    clearCache();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

// 5. Delete a product
const deleteProduct = (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = db
      .prepare(
        `SELECT id, name, price
         FROM products WHERE id = ?`
      )
      .get(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    db.prepare("DELETE FROM products WHERE id = ?").run(id);

    // Clear cached product lists after deletion
    clearCache();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
