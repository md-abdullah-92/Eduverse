const prisma = require('../prismaClient');

module.exports = {
  
  createCourse: async (req, res) => {
    try {
      const { title, description, price, coverPhotoUrl, level, instructorId } = req.body;
      const newCourse = await prisma.course.create({
        data: {
          title,
          description,
          price,
          coverPhotoUrl,
          level,
          instructorId
        }
      });
      res.status(201).json(newCourse);
    } catch (error) {
      res.status(500).json({ message: 'Error creating course', error });
    }
  },

  // Update a course
  updateCourse: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, price, coverPhotoUrl, level } = req.body;
      const updatedCourse = await prisma.course.update({
        where: { id: Number(id) },
        data: { title, description, price, coverPhotoUrl, level}
      });
      res.json(updatedCourse);
    } catch (error) {
      res.status(500).json({ message: 'Error updating course', error });
    }
  },

  // Delete a course
  deleteCourse: async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.course.delete({
        where: { id: Number(id) }
      });
      res.status(204).send();
      // res.status(200).json({"message": "Course Deleted"});
    } catch (error) {
      res.status(500).json({ message: 'Error deleting course', error });
    }
  },

  // Get all courses
  getAllCourses: async (req, res) => {
    try {
      const courses = await prisma.course.findMany();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching courses', error });
    }
  },

  // Get a specific course by ID
  getCourseById: async (req, res) => {
    try {
      const { id } = req.params;
      const course = await prisma.course.findUnique({
        where: { id: Number(id) },
        include: {
          lessons: true,
          outcomes: true
        }
      });
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching course', error });
    }
  },
  // get course by instructor id
  getByInstructorId : async (req, res) => {
    const { instructorId } = req.params;
  
    try {
      const courses = await prisma.course.findMany({
        where: { instructorId },
      });
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch instructor courses', details: error.message });
    }
  }

};


// Create a new course
// hit ->  http://localhost:5000/api/courses/create
// request body -> 
    // {
    //   "title": "programming with c",
    //   "description": "This is a outstanding course to start learning programming.",
    //   "price": 20.0,
    //   "coverPhotoUrl": "http://localhost:5000/api/courses/photo",
    //   "level": "BEGINNER",
    //   "instructorId": "12345"
    // }

// Update a course
// hit ->  http://localhost:5000/api/courses/update/id
// request body -> 
    // {
    //   "title": "programming with python",
    //   "level": "INTERMEDIATE"
    // }

// Delete a course
// hit ->  http://localhost:5000/api/courses/delete/id

// Get all courses
// hit ->  http://localhost:5000/api/courses/all

// Get a specific course by ID
// hit ->  http://localhost:5000/api/courses/get/id

// get courses by instructor id
// hit ->  http://localhost:5000/api/courses/getByInstructorId/id 