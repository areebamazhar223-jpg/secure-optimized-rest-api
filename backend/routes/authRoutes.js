
const express = require("express");
const { body } = require("express-validator");

const {
  signup,
  login,
} = require("../controllers/authController");

const authenticateToken = require("../middleware/authMiddleware");
const db = require("../database");

const router = express.Router();

// Signup API
router.post(
  "/signup",
  [
    body("email")
      .isString()
      .withMessage("Email must be text")
      .bail()
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .bail()
      .isEmail()
      .withMessage("Please provide a valid email"),

    body("password")
      .isString()
      .withMessage("Password must be text")
      .bail()
      .isLength({ min: 8, max: 72 })
      .withMessage("Password must be between 8 and 72 characters")
      .matches(/[a-z]/)
      .withMessage("Password must contain a lowercase letter")
      .matches(/[A-Z]/)
      .withMessage("Password must contain an uppercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain a number"),
  ],
  signup
);

// Login API
router.post(
  "/login",
  [
    body("email")
      .isString()
      .withMessage("Email must be text")
      .bail()
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .bail()
      .isEmail()
      .withMessage("Please provide a valid email"),

    body("password")
      .isString()
      .withMessage("Password must be text")
      .bail()
      .notEmpty()
      .withMessage("Password is required")
      .bail()
      .isLength({ max: 72 })
      .withMessage("Password is too long"),
  ],
  login
);

// Protected current-user API
router.get("/me", authenticateToken, (req, res, next) => {
  try {
    const user = db
      .prepare(
        "SELECT id, email, role, created_at FROM users WHERE id = ?"
      )
      .get(Number(req.user.id));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
