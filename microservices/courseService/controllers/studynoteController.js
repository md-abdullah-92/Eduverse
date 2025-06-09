const prisma = require('../prismaClient')

exports.createStudynote = async (req, res) => {
  const { title, description, teacherId , lessonId} = req.body;
  try {
    const note = await prisma.studynote.create({
      data: { title, description, teacherId , lessonId},
    });
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating study note:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getStudynotesByLesson = async (req, res) => {
  const { lessonId } = req.params;
  try {
    const notes = await prisma.studynote.findMany({
      where: { lessonId: parseInt(lessonId) },
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.deleteStudynote = async (req, res) => {
  try {
    const { id } = req.params;

    const studynote = await prisma.studynote.findUnique({
      where: { id: Number(id) }, // Ensure id is a number
    });

    if (!studynote) {
      return res.status(404).json({ error: 'Study NoTE not found' });
    }

    await prisma.studynote.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ message: 'Study note deleted successfully' });

  } catch (error) {
    console.error('Error deleting Study note:', error);
    return res.status(500).json({ error: 'Failed to delete Study note' });
  }
};