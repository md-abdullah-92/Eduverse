// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

// Public routes (no auth needed)
router.get('/course/:courseId', reviewController.getCourseReviews);
router.get('/course/:courseId/stats', reviewController.getCourseRatingStats);
router.get('/student/:studentId', reviewController.getStudentReviewStats);


// Protected routes (auth required)
router.get('/course/:courseId/student/:studentId', protect, reviewController.getStudentReview);
router.post('/', protect, reviewController.createReview);
router.put('/:reviewId', protect, reviewController.updateReview);
router.delete('/:reviewId', protect, authorize('ADMIN', 'STUDENT'), reviewController.deleteReview);

module.exports = router;