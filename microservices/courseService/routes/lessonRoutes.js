const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { validateLesson } = require('../middleware/validators/lessonValidator'); 
const { validateResult } = require('../middleware/validators/validateResult');

router.post('/add/:courseId', validateLesson, validateResult, lessonController.addLesson);
router.get('/get/:courseId', lessonController.getCourseLessons);
router.put('/update/:lessonId', validateLesson, validateResult, lessonController.updateLesson);
router.delete('/delete/:lessonId', lessonController.deleteLesson);

module.exports = router;