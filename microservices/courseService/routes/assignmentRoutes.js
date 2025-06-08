const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

router.post('/', assignmentController.createAssignment);
router.get('/teacher/:teacherId', assignmentController.getAssignmentsByTeacher);
router.delete('/delete/:id', assignmentController.deleteAssignment);

module.exports = router;
