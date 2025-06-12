const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new quiz result
exports.createQuizResult = async (req, res) => {
  try {
    const {
      title,
      marks,
      fullmark,
      studentId,
      lessonId,
      courseId,
      answeredquestions,
    } = req.body;

    const result = await prisma.quizresults.create({
      data: {
        title,
        marks,
        fullmark,
        studentId,
        lessonId,
        courseId,
        answeredquestions: {
          create: answeredquestions.map(q => ({
            question: q.question,
            correctAnswer: q.correctAnswer,
            options: q.options,
            explanation: q.explanation || null,
            difficulty: q.difficulty || "medium",
            type: q.type || "mcq",
            useranswer: q.useranswer || null,
          })),
        },
      },
      include: {
        answeredquestions: true,
        student: true,
      },
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating quiz result:", error);
    res.status(500).json({ error: "Failed to create quiz result" });
  }
};

// Get all results for a student
exports.getResultsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const results = await prisma.quizresults.findMany({
      where: { studentId: Number(studentId) },
      include: {
        answeredquestions: true,
      },
    });

    res.json(results);
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ error: "Failed to fetch results" });
  }
};

// Get a single quiz result by ID
exports.getResultById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.quizresults.findUnique({
      where: { id },
      include: {
        answeredquestions: true,
        student: true,
      },
    });

    if (!result) {
      return res.status(404).json({ error: "Result not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching result:", error);
    res.status(500).json({ error: "Failed to fetch result" });
  }
};

// Delete a quiz result
exports.deleteQuizResult = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.quizresults.findUnique({
      where: { id },
    });

    if (!result) {
      return res.status(404).json({ error: "Result not found" });
    }

    await prisma.quizresults.delete({
      where: { id },
    });

    res.json({ message: "Quiz result deleted successfully" });
  } catch (error) {
    console.error("Error deleting result:", error);
    res.status(500).json({ error: "Failed to delete result" });
  }
};
