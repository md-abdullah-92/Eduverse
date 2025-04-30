const prisma = require('../prismaClient');

// Add a lesson to a course
exports.addLesson = async (req, res) => {
  const { courseId } = req.params;
  const { title, description, videoUrl, notes } = req.body;

  try {
    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        videoUrl,
        notes,
        courseId: parseInt(courseId),
      }
    });
    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add lesson', details: error.message });
  }
};

// Get all lessons of a course
exports.getCourseLessons = async (req, res) => {
  const { courseId } = req.params;

  try {
    const lessons = await prisma.lesson.findMany({
      where: { courseId: parseInt(courseId) },
    });
    res.status(200).json(lessons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lessons', details: error.message });
  }
};

// Update a lesson by ID
exports.updateLesson = async (req, res) => {
  const { lessonId } = req.params;
  const { title, description, videoUrl, notes } = req.body;

  try {
    const updatedLesson = await prisma.lesson.update({
      where: { id: parseInt(lessonId) },
      data: {
        title,
        description,
        videoUrl,
        notes,
      },
    });
    res.status(200).json(updatedLesson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lesson', details: error.message });
  }
};

// Delete a lesson by ID
exports.deleteLesson = async (req, res) => {
  const { lessonId } = req.params;

  try {
    await prisma.lesson.delete({
      where: { id: parseInt(lessonId) },
    });
    res.status(200).json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lesson', details: error.message });
  }
};

// create lesson
// hit -> post ->  http://localhost:5000/api/lessons/add/:courseId
// request body -> 
    // {
    //   "title": "Lesson 1",
    //   "description": "This is a lesson description.",
    //   "videoUrl": "http://localhost:5000/api/lessons/video",
    //   "notes": "This is a lesson notes."
    // }

// update lesson
// hit -> put ->  http://localhost:5000/api/lessons/update/:lessonId
// request body -> 
    // {
    //   "title": "Intorduction to programming"
    // }

// delete lesson
// hit -> delete ->  http://localhost:5000/api/lessons/delete/:lessonId

// get all lessons of a course
// hit -> get ->  http://localhost:5000/api/lessons/get/:courseId
