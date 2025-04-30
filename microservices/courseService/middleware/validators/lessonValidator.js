// middleware/lessonValidator.js
const { check } = require('express-validator');

const validateLesson = [
  check('title')
    .trim()
    .notEmpty().withMessage('Title is required'),

  check('description')
    .optional()
    .trim()
    .notEmpty().withMessage('Description is required'),

//   check('videoUrl')
//     .optional()
//     .isURL().withMessage('Invalid video URL'),

  check('notes')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Notes too long'),
];


module.exports = { validateLesson };
