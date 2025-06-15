const prisma = require('../prismaClient')


exports.getTeacherStats = async (req, res) => {
  const { teacherId } = req.params;

  try {
    const courses = await prisma.course.findMany({
      where: { instructorId: teacherId },
      select: {
        id: true,
        title: true,
        averageRating: true,
        enrollments: true,
        studentQuestions: {
          select: {
            isAnswered: true
          }
        }
      }
    });
    


    const stats = courses.map(course => {
      const answered = course.studentQuestions.filter(q => q.isAnswered).length;
      const unanswered = course.studentQuestions.length - answered;

      return {
        courseId: course.id,
        courseTitle: course.title,
        averageRating: course.averageRating || 0,
        totalEnrollments: course.enrollments.length,
        answeredQuestions: answered,
        unansweredQuestions: unanswered
      };
    });

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error in getTeacherStats:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
