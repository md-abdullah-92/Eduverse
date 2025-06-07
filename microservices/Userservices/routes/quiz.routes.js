const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');

// POST /quizzes - create quiz
router.post('/', quizController.createQuiz);

// POST /quizzes/:quizId/questions - add question to quiz
router.post('/:quizId/questions', quizController.addQuestion);

// GET /quizzes/:quizId - get quiz with questions
router.get('/:quizId', quizController.getQuizWithQuestions);
// DELETE /quizzes/:id - delete quiz
router.delete('/delete/:id', quizController.deleteQuiz);

module.exports = router;
