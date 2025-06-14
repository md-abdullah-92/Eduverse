const express = require("express");
const router = express.Router();
const qnaController = require("../controllers/qnaControllers");

router.post("/questions", qnaController.askQuestion);
router.get("/courses/:courseId/questions", qnaController.getQuestionsByCourse);
router.get("/questions/:id", qnaController.getQuestionById);
router.post("/answers", qnaController.answerQuestion);
router.get("/courses/:courseId/questions/unanswered", qnaController.getUnansweredQuestions);
router.get("/courses/:courseId/questions/answered", qnaController.getAnsweredQuestions);
router.get("/students/:studentId/questions", qnaController.getQuestionsByStudent);

module.exports = router;
