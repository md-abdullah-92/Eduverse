const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');

// Enrollment Routes
router.post('/enroll', enrollmentController.enrollStudent);
router.delete('/unenroll/:id', enrollmentController.unenrollStudent);
router.get('/student/:studentId', enrollmentController.getStudentEnrollments);
router.get('/course/:courseId', enrollmentController.getCourseEnrollments);
router.get('/:id', enrollmentController.getEnrollment);
router.get('/stats/:studentId', enrollmentController.getStudentStats);
router.get('/stats/teacher/:instructorId', enrollmentController.getTeacherStats);

module.exports = router;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                