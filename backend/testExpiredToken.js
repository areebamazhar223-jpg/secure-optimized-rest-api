require("dotenv").config();
const jwt = require("jsonwebtoken");

const expiredToken = jwt.sign(
  {
    role: "user",
  },
  process.env.JWT_SECRET,
  {
    subject: "2",
    expiresIn: "-1s",
  }
);

console.log("Expired test token:", expiredToken);