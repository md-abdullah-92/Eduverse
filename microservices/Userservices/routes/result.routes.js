const express = require('express');
const router = express.Router();
const resultController = require('../controllers/result.controller');

router.post('/', resultController.createQuizResult);
router.get('/student/:studentId', resultController.getResultsByStudent);
router.get('/:id', resultController.getResultById);
router.delete('/:id', resultController.deleteQuizResult);

module.exports = router;
