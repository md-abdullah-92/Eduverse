const express = require('express');
const router = express.Router();
const studynoteController = require('../controllers/studynoteController');

router.post('/', studynoteController.createStudynote);
router.get('/lesson/:lessonId', studynoteController.getStudynotesByLesson);
router.delete('/delete/:id', studynoteController.deleteStudynote);

module.exports = router;
