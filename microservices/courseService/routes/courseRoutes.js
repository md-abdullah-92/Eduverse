const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { courseValidator } = require('../middleware/validators/courseValidator');
const { validateResult } = require('../middleware/validators/validateResult');

// Course Routes
router.post('/create', courseValidator, validateResult, courseController.createCourse);
router.put('/update/:id', courseValidator, validateResult, courseController.updateCourse);
router.delete('/delete/:id', courseController.deleteCourse);
router.get('/all', courseController.getAllCourses);
router.get('/get/:id', courseController.getCourseById);
router.get('/getByInstructorId/:id', courseController.getByInstructorId);

module.exports = router;
