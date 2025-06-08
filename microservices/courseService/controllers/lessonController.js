const prisma = require('../prismaClient');

// Add a lesson to a course
exports.addLesson = async (req, res) => {
  console.log("req.params", req.params);
  console.log("req.body", req.body);
  const { courseId } = req.params;
  const { title, description, videoUrl, notes, orderIndex } = req.body;

  try {
    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        videoUrl,
        orderIndex: parseInt(orderIndex),
        course: {
          connect: { id: parseInt(courseId) },
        },
        
      }
    });
    res.status(201).json(lesson);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to add lesson', details: error.message });
  }
};

// Get all lessons of a course
exports.getCourseLessons = async (req, res) => {
  const { courseId } = req.params;

  try {
    const lessons = await prisma.lesson.findMany({
      where: { courseId: parseInt(courseId) },
      orderBy: { orderIndex: 'asc' }
    });
    res.status(200).json(lessons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lessons', details: error.message });
  }
};

// Update a lesson by ID
exports.updateLesson = async (req, res) => {
  const { lessonId } = req.params;
  const { title, description, videoUrl, notes, orderIndex } = req.body;

  try {
    const updatedLesson = await prisma.lesson.update({
      where: { id: parseInt(lessonId) },
      data: {
        title,
        description,
        videoUrl,
        notes,
        orderIndex: parseInt(orderIndex),
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

// **NEW: Bulk update lessons for a course**
exports.bulkUpdateLessons = async (req, res) => {
  const { courseId } = req.params;
  const { lessons } = req.body;

  if (!lessons || !Array.isArray(lessons)) {
    return res.status(400).json({ error: 'Lessons array is required' });
  }

  try {
    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get existing lessons for this course
      const existingLessons = await tx.lesson.findMany({
        where: { courseId: parseInt(courseId) },
        select: { id: true, title: true, description: true, videoUrl: true, notes: true, orderIndex: true }
      });

      const existingLessonMap = new Map(existingLessons.map(lesson => [lesson.id, lesson]));
      const incomingLessonIds = new Set(lessons.filter(l => l.id).map(l => parseInt(l.id)));
      
      const operations = {
        created: [],
        updated: [],
        deleted: []
      };

      // Process incoming lessons
      for (const lesson of lessons) {
        const lessonData = {
          title: lesson.title,
          description: lesson.description,
          videoUrl: lesson.videoUrl,
          notes: lesson.notes,
          orderIndex: parseInt(lesson.orderIndex)
        };

        if (lesson.id) {
          // Update existing lesson
          const lessonId = parseInt(lesson.id);
          if (existingLessonMap.has(lessonId)) {
            const updatedLesson = await tx.lesson.update({
              where: { id: lessonId },
              data: lessonData
            });
            operations.updated.push(updatedLesson);
          }
        } else {
          // Create new lesson
          const newLesson = await tx.lesson.create({
            data: {
              ...lessonData,
              course: {
                connect: { id: parseInt(courseId) }
              }
            }
          });
          operations.created.push(newLesson);
        }
      }

      // Delete lessons that are no longer present
      const lessonsToDelete = existingLessons.filter(lesson => !incomingLessonIds.has(lesson.id));
      
      for (const lesson of lessonsToDelete) {
        await tx.lesson.delete({
          where: { id: lesson.id }
        });
        operations.deleted.push({ id: lesson.id, title: lesson.title });
      }

      return operations;
    });

    res.status(200).json({
      message: 'Lessons updated successfully',
      summary: {
        created: result.created.length,
        updated: result.updated.length,
        deleted: result.deleted.length
      },
      details: result
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      error: 'Failed to bulk update lessons', 
      details: error.message 
    });
  }
};

// Mark Lesson as completed
exports.markLessonCompleted = async (req, res) => {
  const { lessonId, enrollmentId } = req.params;
  
  try {
    const lessonCompletion = await prisma.lessonCompletion.upsert({
      where: {
        enrollmentId_lessonId: {
          lessonId: parseInt(lessonId, 10),
          enrollmentId: parseInt(enrollmentId, 10)
        }
      },
      update: {},
      create: {
        lessonId: parseInt(lessonId, 10),
        enrollmentId: parseInt(enrollmentId, 10)
      }
    });
    
    // If we're updating an existing record, it means it was already marked as completed
    const isNew = lessonCompletion.createdAt === lessonCompletion.updatedAt;
    
    res.status(200).json({
      ...lessonCompletion,
      isNew
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to mark lesson as completed', details: error.message });
  }
};

// API Endpoints:
// create lesson
// POST -> http://localhost:5000/api/lessons/add/:courseId
// request body: {
//   "title": "Lesson 1",
//   "description": "This is a lesson description.",
//   "videoUrl": "http://localhost:5000/api/lessons/video",
//   "notes": "This is a lesson notes.",
//   "orderIndex": 0
// }

// update lesson
// PUT -> http://localhost:5000/api/lessons/update/:lessonId
// request body: {
//   "title": "Introduction to programming"
// }

// delete lesson
// DELETE -> http://localhost:5000/api/lessons/delete/:lessonId

// get all lessons of a course
// GET -> http://localhost:5000/api/lessons/get/:courseId

// **NEW: bulk update lessons**
// PUT -> http://localhost:5000/api/lessons/bulk/:courseId
// request body: {
//   "lessons": [
//     {
//       "id": 1, // existing lesson - will be updated
//       "title": "Updated Lesson 1",
//       "description": "Updated description",
//       "videoUrl": "http://example.com/video1",
//       "notes": "Updated notes",
//       "orderIndex": 0
//     },
//     {
//       // no id - will be created as new lesson
//       "title": "New Lesson 2",
//       "description": "New lesson description",
//       "videoUrl": "http://example.com/video2",
//       "notes": "New lesson notes",
//       "orderIndex": 1
//     }
//     // lessons not in this array but existing in DB will be deleted
//   ]
// }

// mark lesson as completed
// POST -> http://localhost:5000/api/lessons/mark-completed/:lessonId/:enrollmentId