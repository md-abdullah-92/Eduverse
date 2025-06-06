const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');

router.post('/', assignmentController.createAssignment);
router.get('/teacher/:teacherId', assignmentController.getAssignmentsByTeacher);

module.exports = router;
