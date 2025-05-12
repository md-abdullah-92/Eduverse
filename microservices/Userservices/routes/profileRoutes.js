const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
    updateStudentProfile,
    updateTeacherProfile,
    updateUserProfile,
    getProfile,
    getProfileById,
    getAllTeachers,
    getAllStudents
} = require("../controllers/profileController");

// Get profile by userId (public or protected as needed)
router.get("/:id", getProfileById);

// Get profile
router.get("/", protect, getProfile);

//Get all teacher profiles
router.get("/teacher/all",  getAllTeachers);
// Get all student profiles
router.get("/student/all", getAllStudents);

// Update profiles
router.put("/student", protect, updateStudentProfile);
router.put("/teacher", protect, updateTeacherProfile);
router.put("/user", protect, updateUserProfile);

module.exports = router;

