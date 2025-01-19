const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const header = req.headers["authorization"];
  if (!header)
    return res.status(401).json({ message: "You are not logged in!" });

  const token = header.split(" ")[1];

  if (!token) return res.status(403).json({ message: "Forbidden!" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err.message);
      return res.status(400).json({ message: "Bad token!" });
    }
    req.user = decoded.username;
    req.userId = decoded.userId;
    req.isAdmin = decoded.isAdmin;
    req.adminId = decoded.adminId;
    next();
  });
};

module.exports = { verifyJWT };
