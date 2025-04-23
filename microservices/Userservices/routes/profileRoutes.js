const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
    updateStudentProfile,
    updateTeacherProfile,
    updateUserProfile,
    getProfile,
    getProfileById
} = require("../controllers/profileController");

// Get profile by userId (public or protected as needed)
router.get("/:id", getProfileById);

// Get profile
router.get("/", protect, getProfile);

// Update profiles
router.put("/student", protect, updateStudentProfile);
router.put("/teacher", protect, updateTeacherProfile);
router.put("/user", protect, updateUserProfile);

module.exports = router;
