const express = require('express');
const router = express.Router();
const studynoteController = require('../controllers/studynote.controller');

router.post('/', studynoteController.createStudynote);
router.get('/teacher/:teacherId', studynoteController.getStudynotesByTeacher);

module.exports = router;
