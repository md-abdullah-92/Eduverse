const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// Quiz Routes
router.route('/')
  .get(quizController.getQuizzes)           // Get all quizzes
  .post(quizController.createQuiz);         // Create a new quiz

router.route('/:id')
  .get(quizController.getQuiz)             // Get single quiz by ID
  .put(quizController.updateQuiz)           // Update quiz
  .delete(quizController.deleteQuiz);       // Delete quiz

// Get quiz by lesson ID
router.get('/lesson/:lessonId', quizController.getQuizzesByLessonId);

// Quiz Questions Routes
router.route('/:quizId/questions')
  .post(quizController.createQuestion);     // Add a question to a quiz

router.route('/questions/:questionId')
  .put(quizController.updateQuestion)       // Update a question
  .delete(quizController.deleteQuestion);   // Delete a question

// Special route to save complete quiz with questions and options
router.post('/save/:lessonId', quizController.saveCompleteQuiz);

module.exports = router;