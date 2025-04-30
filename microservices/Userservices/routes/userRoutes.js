const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

// @route   GET /api/user/me
// @desc    Get user id and role from token
// @access  Private
router.get("/me", protect, (req, res) => {
    // req.user is set by protect middleware
    const { id, role } = req.user;
    res.json({ id, role });
});

module.exports = router;
