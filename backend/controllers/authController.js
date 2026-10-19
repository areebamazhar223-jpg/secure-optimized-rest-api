
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database");
const { validationResult } = require("express-validator");

// Register a new user
const signup = (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 12);

    const result = db
      .prepare(
        "INSERT INTO users (email, password) VALUES (?, ?)"
      )
      .run(normalizedEmail, hashedPassword);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: result.lastInsertRowid,
        email: normalizedEmail,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login an existing user
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    const user = db
      .prepare(
        "SELECT id, email, password, role FROM users WHERE email = ?"
      )
      .get(normalizedEmail);

    // Use the same message for unknown email or wrong password
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare submitted password with stored hash
    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // JWT secret must be configured in .env
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Create token
    const token = jwt.sign(
      {
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        subject: String(user.id),
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login };
