const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');

router.post('/', assignmentController.createAssignment);
router.get('/teacher/:teacherId', assignmentController.getAssignmentsByTeacher);
router.delete('/delete/:id', assignmentController.deleteAssignment);

module.exports = router;
