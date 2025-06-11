const prisma = require('../prismaClient');

const reviewController = {
  // Get all reviews for a course with pagination (PUBLIC)
  getCourseReviews: async (req, res) => {
    try {
      const { courseId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const reviews = await prisma.review.findMany({
        where: {
          courseId: parseInt(courseId)
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      });

      const totalReviews = await prisma.review.count({
        where: {
          courseId: parseInt(courseId)
        }
      });

      res.json({
        success: true,
        data: {
          reviews,
          pagination: {
            page,
            limit,
            total: totalReviews,
            pages: Math.ceil(totalReviews / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reviews'
      });
    }
  },

  // Get specific student's review for a course (PROTECTED)
  getStudentReview: async (req, res) => {
    try {
      const { courseId, studentId } = req.params;
      const userId = String(req.user.id);

      // Authorization: User can only access their own review OR admin can access any
      if (userId !== studentId && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to access this review'
        });
      }

      const review = await prisma.review.findUnique({
        where: {
          courseId_studentId: {
            courseId: parseInt(courseId),
            studentId: studentId
          }
        }
      });

      res.json({
        success: true,
        data: review
      });
    } catch (error) {
      console.error('Error fetching student review:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch review'
      });
    }
  },

  // Create a new review (PROTECTED)
  createReview: async (req, res) => {
    try {
      const { courseId, rating, comment } = req.body;
      const studentId = String(req.user.id); // Get from authenticated user

      // Validate input
      if (!courseId || !rating) {
        return res.status(400).json({
          success: false,
          message: 'Course ID and rating are required'
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      // Check if student is enrolled in the course
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          courseId: parseInt(courseId),
          studentId: studentId
        }
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You must be enrolled in this course to leave a review'
        });
      }

      // Check if review already exists
      const existingReview = await prisma.review.findUnique({
        where: {
          courseId_studentId: {
            courseId: parseInt(courseId),
            studentId: studentId
          }
        }
      });

      if (existingReview) {
        return res.status(409).json({
          success: false,
          message: 'You have already reviewed this course'
        });
      }

      // Create the review
      const review = await prisma.review.create({
        data: {
          courseId: parseInt(courseId),
          studentId,
          rating: parseInt(rating),
          comment: comment || null
        }
      });

      // Update course average rating
      await updateCourseAverageRating(parseInt(courseId));

      res.status(201).json({
        success: true,
        data: review,
        message: 'Review created successfully'
      });
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create review'
      });
    }
  },

  // Update existing review (PROTECTED)
  updateReview: async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { rating, comment } = req.body;
      const studentId = String(req.user.id); // From authenticated user

      // Validate input
      if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      // Check if review exists and belongs to the student
      const existingReview = await prisma.review.findUnique({
        where: { id: parseInt(reviewId) }
      });

      if (!existingReview) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      // Authorization: Only the review owner can update
      if (existingReview.studentId !== studentId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to update this review'
        });
      }

      // Update the review
      const updatedReview = await prisma.review.update({
        where: { id: parseInt(reviewId) },
        data: {
          ...(rating && { rating: parseInt(rating) }),
          ...(comment !== undefined && { comment })
        }
      });

      // Update course average rating if rating changed
      if (rating && rating !== existingReview.rating) {
        await updateCourseAverageRating(existingReview.courseId);
      }

      res.json({
        success: true,
        data: updatedReview,
        message: 'Review updated successfully'
      });
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update review'
      });
    }
  },

  // Delete review (PROTECTED)
  deleteReview: async (req, res) => {
    try {
      const { reviewId } = req.params;
      const studentId = String(req.user.id);

      // Check if review exists
      const existingReview = await prisma.review.findUnique({
        where: { id: parseInt(reviewId) }
      });

      if (!existingReview) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      // Authorization: Student can delete own review, Admin can delete any
      if (existingReview.studentId !== studentId && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to delete this review'
        });
      }

      // Delete the review
      await prisma.review.delete({
        where: { id: parseInt(reviewId) }
      });

      // Update course average rating
      await updateCourseAverageRating(existingReview.courseId);

      res.json({
        success: true,
        message: 'Review deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete review'
      });
    }
  },

  // Get course rating statistics (PUBLIC)
  getCourseRatingStats: async (req, res) => {
    try {
      const { courseId } = req.params;

      const stats = await prisma.review.aggregate({
        where: {
          courseId: parseInt(courseId)
        },
        _avg: {
          rating: true
        },
        _count: {
          rating: true
        }
      });

      // Get rating distribution
      const ratingDistribution = await prisma.review.groupBy({
        by: ['rating'],
        where: {
          courseId: parseInt(courseId)
        },
        _count: {
          rating: true
        }
      });

      // Format distribution for easier frontend consumption
      const distribution = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      };
      
      ratingDistribution.forEach(item => {
        distribution[item.rating] = item._count.rating;
      });

      res.json({
        success: true,
        data: {
          averageRating: stats._avg.rating || 0,
          totalReviews: stats._count.rating || 0,
          distribution
        }
      });
    } catch (error) {
      console.error('Error fetching rating stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rating statistics'
      });
    }
  },
  getStudentReviewStats: async (req, res) => {
    try {
      const { studentId } = req.params;

      const stats = await prisma.review.aggregate({
        where: {
          studentId: studentId
        },
        _avg: {
          rating: true
        },
        _count: {
          rating: true
        }
      });

      // Get rating distribution
      const ratingDistribution = await prisma.review.groupBy({
        by: ['rating'],
        where: {
          studentId: studentId
        },
        _count: {
          rating: true
        }
      });

      // Format distribution for easier frontend consumption
      const distribution = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      };
      
      ratingDistribution.forEach(item => {
        distribution[item.rating] = item._count.rating;
      });

      res.json({
        success: true,
        data: {
          averageRating: stats._avg.rating || 0,
          totalReviews: stats._count.rating || 0,
          distribution
        }
      });
    } catch (error) {
      console.error('Error fetching rating stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rating statistics'
      });
    }
  }
};

// Helper function to update course average rating
async function updateCourseAverageRating(courseId) {
  const stats = await prisma.review.aggregate({
    where: { courseId },
    _avg: { rating: true }
  });

  await prisma.course.update({
    where: { id: courseId },
    data: { averageRating: stats._avg.rating || 0 }
  });
}

module.exports = reviewController;

// API Endpoints:
// get course rating statistics
// GET -> http://localhost:5000/api/reviews/course/:courseId  

// get student review
// GET -> http://localhost:5000/api/reviews/student/:studentId

// create review
// POST -> http://localhost:5000/api/reviews/create/:courseId/:studentId

// update review
// PUT -> http://localhost:5000/api/reviews/update/:reviewId

// delete review
// DELETE -> http://localhost:5000/api/reviews/delete/:reviewId

// get course rating statistics
// GET -> http://localhost:5000/api/reviews/course/:courseId    