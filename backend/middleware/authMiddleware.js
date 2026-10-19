
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  // Step 1: Authorization header check karo
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access token is required",
    });
  }

  // Step 2: Token extract karo
  const token = authHeader.split(" ")[1];

  try {
    // Step 3: JWT secret check karo
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");
      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error",
      });
    }

    // Step 4: Token verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 5: User ki information request mein save karo
    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };

    console.log("Authenticated user:", req.user);

    // Step 6: Agle middleware ya controller ko allow karo
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authenticateToken;
