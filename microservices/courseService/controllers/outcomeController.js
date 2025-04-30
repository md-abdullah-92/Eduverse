const prisma = require('../prismaClient');

// Add an outcome to a course
exports.addOutcome = async (req, res) => {
  const { courseId } = req.params;
  const { outcome } = req.body;

  try {
    const newOutcome = await prisma.courseOutcome.create({
      data: {
        courseId: parseInt(courseId),
        outcome,
      },
    });
    res.status(201).json(newOutcome);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add outcome', details: error.message });
  }
};

// Get all outcomes for a course
exports.getCourseOutcomes = async (req, res) => {
  const { courseId } = req.params;

  try {
    const outcomes = await prisma.courseOutcome.findMany({
      where: {
        courseId: parseInt(courseId),
      },
    });
    res.status(200).json(outcomes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch outcomes', details: error.message });
  }
};

// Delete an outcome by ID
exports.deleteOutcome = async (req, res) => {
  const { outcomeId } = req.params;

  try {
    await prisma.courseOutcome.delete({
      where: {
        id: parseInt(outcomeId),
      },
    });
    res.status(200).json({ message: 'Outcome deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete outcome', details: error.message });
  }
};

// add outcome
// hit -> post ->  http://localhost:5000/api/outcomes/add/:courseId
// request body -> 
    // {
    //   "outcome": "This is a course outcome."
    // }

// get all outcomes for a course
// hit -> get ->  http://localhost:5000/api/outcomes/get/:courseId

// delete an outcome by ID
// hit -> delete ->  http://localhost:5000/api/outcomes/delete/:outcomeId
