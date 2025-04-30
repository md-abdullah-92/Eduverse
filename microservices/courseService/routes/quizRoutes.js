const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

router.post('/create/:lessonId', quizController.createQuiz);
router.get('/get/:lessonId', quizController.getLessonQuiz);
router.post('/addQuestion/:lessonId', quizController.createQuestion);
router.get('/getQuestions/:lessonId', quizController.getQuizQuestions);
router.put('/update/:questionId', quizController.updateQuestion);
router.delete('/delete/:questionId', quizController.deleteQuestion);

module.exports = router;