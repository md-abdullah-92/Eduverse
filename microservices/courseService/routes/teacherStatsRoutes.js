const express = require("express");
const router = express.Router();
const { getTeacherStats } = require("../controllers/teacherStatsController");

// GET /api/teacher-stats/:teacherId
router.get("/:teacherId", getTeacherStats);

module.exports = router;
