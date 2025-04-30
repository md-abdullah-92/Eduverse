const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');

// Enrollment Routes
router.post('/enroll', enrollmentController.enrollStudent);
router.delete('/unenroll/:id', enrollmentController.unenrollStudent);
router.get('/student/:studentId', enrollmentController.getStudentEnrollments);
router.get('/course/:courseId', enrollmentController.getCourseEnrollments);

module.exports = router;
