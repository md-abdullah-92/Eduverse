const express = require('express');
const router = express.Router();
const outcomeController = require('../controllers/outcomeController');

router.post('/add/:courseId', outcomeController.addOutcome);
router.get('/get/:courseId', outcomeController.getCourseOutcomes);
router.delete('/delete/:outcomeId', outcomeController.deleteOutcome);

module.exports = router;
