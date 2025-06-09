const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

router.post('/', assignmentController.createAssignment);
router.get('/lesson/:lessonId', assignmentController.getAssignmentsByLesson);
router.delete('/delete/:id', assignmentController.deleteAssignment);

module.exports = router;
