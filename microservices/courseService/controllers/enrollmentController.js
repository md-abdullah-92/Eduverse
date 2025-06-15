const prisma = require('../prismaClient');

// Enroll a student into a course
exports.enrollStudent = async (req, res) => {
  try {
    console.log(req.body)
    const { studentId, courseId } = req.body;
    
    // Check if enrollment already exists
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId,
        courseId,
      }
    });
    if (existingEnrollment) {
      return res.status(400).json({ error: 'Student is already enrolled in this course' });
    }
    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        courseId,
      },
    });
    res.status(201).json(enrollment);
  } catch (error) {
    console.log('Error in enrollStudent:', error);
    res.status(500).json({ 
      error: 'Failed to enroll student', 
      details: error.message 
    });
  }
};

// Unenroll a student (delete enrollment by ID)
exports.unenrollStudent = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.enrollment.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.status(200).json({ message: 'Student unenrolled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unenroll student', details: error.message });
  }
};

// Get all enrollments of a student
exports.getStudentEnrollments = async (req, res) => {
  const { studentId } = req.params;
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: { course: true },
    });
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrollments', details: error.message });
  } 
};

// Get all enrollments in a course
exports.getCourseEnrollments = async (req, res) => {
  const { courseId } = req.params;
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
    });
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrollments', details: error.message });
  }
};
// get enrollment by id 
exports.getEnrollment = async (req, res) => {
  const { id } = req.params;
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(id) },
      include: { 
        course: {
          include: {
            lessons: {
              orderBy: {
                orderIndex: 'asc'
              }
            },
            outcomes: true,
          }
        }, 
        lessonCompletions: {
          include: {
            lesson: true // Include lesson details in completions
          }
        }
      },
    });
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    const totalLessons = enrollment.course.lessons.length;
    const completedLessons = enrollment.lessonCompletions.length;
    
    let progressPercentage = 0;
    if (totalLessons > 0) {
      progressPercentage = (completedLessons / totalLessons) * 100;
    }
    
    progressPercentage = Math.round(progressPercentage * 100) / 100;
    
    if (enrollment.progressPercentage !== progressPercentage) {
      
      const updatedEnrollment = await prisma.enrollment.update({
        where: { id: parseInt(id) },
        data: { 
          progressPercentage: parseFloat(progressPercentage)
        }
      });
      
      // Update the enrollment object with the new progress
      enrollment.progressPercentage = updatedEnrollment.progressPercentage;
    }
    
    res.status(200).json(enrollment);
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    res.status(500).json({ error: 'Failed to fetch enrollment', details: error.message });
  }

};

exports.getStudentStats = async (req, res) => {
  const { studentId } = req.params;
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: { course: {
        include: {
          lessons: true,
        }
      }, lessonCompletions: true },
    });
    
    const totalEnrollments = enrollments.length;
    
    // Calculate average progress with null checks
    const averageProgress = totalEnrollments > 0
      ? enrollments.reduce(
          (sum, enrollment) => sum + (Number(enrollment?.progressPercentage) || 0),
          0
        ) / totalEnrollments
      : 0;

    // Count completed courses (progress >= 100%)
    const completedCoursesData = enrollments.filter(
      (enrollment) => (Number(enrollment?.progressPercentage) || 0) >= 100
    );

    const completedCourses = completedCoursesData.length;

    // Calculate total lessons across all enrolled courses
    const totalLessons = enrollments.reduce((sum, enrollment) => {
      const course = enrollment?.course;
      const lessonsCount = Array.isArray(course?.lessons) ? course.lessons.length : 0;
      return sum + lessonsCount;
    }, 0);

    // Count total completed lessons
    const completedLessons = enrollments.reduce((sum, enrollment) => {
      const completions = enrollment?.lessonCompletions;
      const completionsCount = Array.isArray(completions) ? completions.length : 0;
      return sum + completionsCount;
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        totalEnrollments,
        averageProgress,
        completedCourses,
        completedCoursesData,
        totalLessons,
        completedLessons,
      }
    });
  } catch (error) {
    console.error('Error fetching student stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student stats',
      details: error.message
    });
  }
}

exports.getTeacherStats = async (req, res) => {
    const { instructorId } = req.params;
    try {
      // Get all courses by instructor (including those with no enrollments)
      const courses = await prisma.course.findMany({
        where: { instructorId: instructorId },
        include: {
          lessons: true,
          enrollments: {
            include: {
              lessonCompletions: true
            }
          }
        }
      });
  
      // Get all enrollments for instructor's courses
      const enrollments = await prisma.enrollment.findMany({
        where: { 
          course: {
            instructorId: instructorId
          } 
        },
        include: { 
          course: {
            include: {
              lessons: true,
            }
          }, 
          lessonCompletions: true 
        },
      });
      
      // Basic counts
      const totalCourses = courses.length;
      const totalLessons = courses.reduce((sum, course) => {
        return sum + (Array.isArray(course.lessons) ? course.lessons.length : 0);
      }, 0);
      
      // Enrollment-related stats
      const totalEnrollments = enrollments.length;
      
      // Get unique students enrolled in instructor's courses
      const uniqueStudents = new Set();
      enrollments.forEach(enrollment => {
        if (enrollment?.studentId) {
          uniqueStudents.add(enrollment.studentId);
        }
      });
      const totalStudents = uniqueStudents.size;
      
      // Count completed enrollments (progress >= 100%)
      const completedEnrollments = enrollments.filter(
        (enrollment) => (Number(enrollment?.progressPercentage) || 0) >= 100
      ).length;
      
      // Calculate completion rate
      const completionRate = totalEnrollments > 0 
        ? Math.round((completedEnrollments / totalEnrollments) * 100) 
        : 0;
      
      // Calculate total revenue (assuming course has a price field)
      const totalRevenue = enrollments.reduce((sum, enrollment) => {
        const coursePrice = Number(enrollment?.course?.price) || 0;
        return sum + coursePrice;
      }, 0);
      
      // Calculate average rating, excluding courses with zero ratings
      const totalRatingCourses = courses.filter(course => Number(course?.averageRating) > 0);
      const totalRatingCoursesCount = totalRatingCourses.length;
      const totalRating = totalRatingCourses.reduce((sum, course) => {
        return sum + Number(course.averageRating);
      }, 0);
      const averageRating = totalRatingCoursesCount > 0 
        ? Math.round((totalRating / totalRatingCoursesCount) * 10) / 10 // Keep one decimal place
        : 0;
      
      // Active vs inactive enrollments (assuming active means progress > 0)
      const activeEnrollments = enrollments.filter(
        (enrollment) => (Number(enrollment?.progressPercentage) || 0) > 0
      ).length;
      const inactiveEnrollments = totalEnrollments - activeEnrollments;

      const bestSellingCourse = courses.reduce((max, course) => {
        
        const enrollmentsCount = course.enrollments.length;
        return enrollmentsCount > max ? course : max;
      }, null);
      
      res.status(200).json({
        success: true,
        data: {
          // Course stats (all courses by instructor)
          totalCourses,
          totalLessons,
          
          // Enrollment stats
          totalEnrollments,
          totalStudents,
          completedEnrollments,
          completionRate,
          totalRatingCoursesCount,
          averageRating,
          activeEnrollments,
          inactiveEnrollments,
          bestSellingCourse,
          
          // Revenue stats
          totalRevenue
        }
      });
    } catch (error) {
      console.error('Error fetching teacher stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch teacher stats',
        details: error.message
      });
    }
  }

// Create an enrollment
// hit -> post ->  http://localhost:5000/api/enrollments/enroll
// request body -> 
    // {
    //   "studentId": "12345",
    //   "courseId": 1
    // }

// Unenroll a student
// hit -> delete ->  http://localhost:5000/api/enrollments/unenroll/:id

// Get all enrollments of a student
// hit -> get ->  http://localhost:5000/api/enrollments/student/:studentId

// Get all enrollments in a course
// hit -> get ->  http://localhost:5000/api/enrollments/course/:courseId

// Get a specific enrollment by ID
// hit -> get ->  http://localhost:5000/api/enrollments/:id

// Get student stats
// hit -> get ->  http://localhost:5000/api/enrollments/stats/:studentId

// Get teacher stats
// hit -> get ->  http://localhost:5000/api/enrollments/stats/teacher/:instructorId
