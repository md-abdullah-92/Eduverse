const { check } = require('express-validator');

const courseValidator = [
  // Title
  check('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),

  // Description
  check('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),

  // Price - Floating point number (positive)
  check('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ gt: -0.0001 }).withMessage('Price must be a valid positive number'),

  // Level (enum style)
  check('level')
    .notEmpty().withMessage('Level is required')
    .isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
    .withMessage('Level must be BEGINNER, INTERMEDIATE or ADVANCED'),

  // Cover photo URL
  check('coverPhotoUrl')
    .optional()
    .isURL().withMessage('Invalid Cover Photo. Try again'),

];

module.exports = { courseValidator };
