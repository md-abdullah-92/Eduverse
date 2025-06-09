const prisma = require('../prismaClient')

exports.createAssignment = async (req, res) => {
  const { title, description, teacherId , lessonId} = req.body;

  // ✅ Basic validation
  if (!title || !description || !teacherId) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const assignment = await prisma.assignment.create({
      data: { title, description, teacherId,lessonId }
    });
    res.status(201).json(assignment);
  } catch (error) {
    console.error("Error creating assignment:", error); // 🔍 Good for debugging
    res.status(500).json({ error: "Internal server error." });
  }
};


exports.getAssignmentsByLesson = async (req, res) => {
  const { lessonId } = req.params;
  try {
    const assignments = await prisma.assignment.findMany({
      where: { lessonId: parseInt(lessonId) },
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await prisma.assignment.findUnique({
      where: { id: Number(id) }, // Ensure id is a number
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    await prisma.assignment.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ message: 'Assignment deleted successfully' });

  } catch (error) {
    console.error('Error deleting assignment:', error);
    return res.status(500).json({ error: 'Failed to delete assignment' });
  }
};
