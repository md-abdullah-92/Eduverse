const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Protect routes - Verify JWT token
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from database
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isVerified: true
                }
            });

            if (!user) {
                res.status(401).json({ message: "User not found" });
                return;
            }

            // Add user to request object
            req.user = user;
            next();
        } catch (error) {
            console.error("Auth middleware error:", error);
            res.status(401).json({ message: "Not authorized, invalid token" });
        }
    } else {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

// Role-based authorization
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
