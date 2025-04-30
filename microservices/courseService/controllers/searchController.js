const prisma = require('../prismaClient')

exports.searchCourses = async (req, res) => {
  const { query } = req.query;

  try {
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { title: { contains: query } },  // case insensitive by default
          { description: { contains: query } }
        ]
      }
    });

    res.json(courses);
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
};


exports.filterCourses = async (req, res) => {
    const {
      level,
      minPrice,
      maxPrice,
      instructorId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
  
    try {
      const filters = {
        AND: [
          level ? { level: level.toUpperCase() } : {},
          minPrice ? { price: { gte: parseFloat(minPrice) } } : {},
          maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {},
          instructorId ? { instructorId: instructorId } : {}
        ]
      };
  
      const courses = await prisma.course.findMany({
        where: filters,
        orderBy: {
          [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc'
        }
      });
  
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: 'Filtering failed', details: error.message });
    }
};

//  Example Queries

// Search courses by title or description (basic text search)
// hit -> get -> http://localhost:5000/api/search/courses?query=javascript

// filter course
// hit -> get -> http://localhost:5000/api/search/filter?level=BEGINNER&sortBy=price&sortOrder=asc

// hit -> get -> http://localhost:5000/api/search/filter?level=BEGINNER&sortBy=price&sortOrder=desc

// hit -> get -> http://localhost:5000/api/search/filter?minPrice=0&maxPrice=200

// hit -> get -> http://localhost:5000/api/search/filter?sortBy=createdAt&sortOrder=desc