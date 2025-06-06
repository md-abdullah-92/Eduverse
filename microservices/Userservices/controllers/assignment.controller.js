const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createAssignment = async (req, res) => {
  const { title, description, teacherId } = req.body;
  try {
    const assignment = await prisma.assignment.create({
      data: { title, description, teacherId },
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAssignmentsByTeacher = async (req, res) => {
  const { teacherId } = req.params;
  try {
    const assignments = await prisma.assignment.findMany({
      where: { teacherId: parseInt(teacherId) },
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
