// middleware/auth.js (JWT-only validation)
const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token (same secret as user service)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Use decoded token data directly (no database lookup)
      req.user = {
        id: decoded.id,
        role: decoded.role,
        name: decoded.name,
      };

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(401).json({ 
        success: false, 
        message: "Not authorized, invalid token" 
      });
    }
  } else {
    console.log("No token provided")
    return res.status(401).json({ 
      success: false, 
      message: "Not authorized, no token" 
    });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };