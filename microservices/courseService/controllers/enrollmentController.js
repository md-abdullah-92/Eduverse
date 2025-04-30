
const prisma = require('../prismaClient');

// Enroll a student into a course
exports.enrollStudent = async (req, res) => {
  const { studentId, courseId } = req.body;

  try {
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        courseId: parseInt(courseId),
      },
    });
    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to enroll student', details: error.message });
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
      where: { courseId: parseInt(courseId) },
    });
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrollments', details: error.message });
  }
};

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
