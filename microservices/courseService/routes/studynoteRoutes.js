const express = require('express');
const router = express.Router();
const studynoteController = require('../controllers/studynoteController');

router.post('/', studynoteController.createStudynote);
router.get('/teacher/:teacherId', studynoteController.getStudynotesByTeacher);
router.delete('/delete/:id', studynoteController.deleteStudynote);

module.exports = router;
