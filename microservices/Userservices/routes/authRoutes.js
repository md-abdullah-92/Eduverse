const express = require("express");
const router = express.Router();
const { 
    register, 
    verifyEmail, 
    resendOTP, 
    login,
    getProfile
} = require("../controllers/authController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);
router.post("/login", login);

// Protected routes
router.get("/profile", protect, getProfile);

// Example of role-based route (only teachers can access)
router.get("/teacher-only", protect, authorize('TEACHER'), (req, res) => {
    res.json({ message: "Teacher access granted!" });
});

module.exports = router;
