const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createStudynote = async (req, res) => {
  const { title, description, teacherId } = req.body;
  try {
    const note = await prisma.studynote.create({
      data: { title, description, teacherId },
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudynotesByTeacher = async (req, res) => {
  const { teacherId } = req.params;
  try {
    const notes = await prisma.studynote.findMany({
      where: { teacherId: parseInt(teacherId) },
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
