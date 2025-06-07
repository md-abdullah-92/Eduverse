const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a quiz (empty questions array)
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, duration, teacherId, questions } = req.body;

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        duration,
        teacher: {
          connect: { userId: teacherId },
        },
        questions: {
          create: questions.map(q => ({
            question: q.question,
            correctAnswer: q.correctAnswer,
            options: q.options,
            explanation: q.explanation || null,
            difficulty: q.difficulty || "medium", // default if not given
            type: q.type || "mcq",
          })),
        },
      },
      include: {
        questions: true,
        teacher: true,
      },
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).json({ error: "Failed to create quiz" });
  }
};

// delete a quiz by ID
exports.deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    await prisma.quiz.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Quiz and related questions deleted successfully' });

  } catch (error) {
    console.error('Error deleting quiz:', error);
    return res.status(500).json({ error: 'Failed to delete quiz' });
  }
};


// Add a question to the quiz JSON array
exports.addQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const newQuestion = req.body;

    const quiz = await prisma.quiz.findUnique({
      where: { id: Number(quizId) },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const updatedQuestions = [...(quiz.questions || []), newQuestion];

    const updatedQuiz = await prisma.quiz.update({
      where: { id: Number(quizId) },
      data: {
        questions: updatedQuestions,
      },
    });

    res.status(200).json(updatedQuiz);
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ error: 'Failed to add question' });
  }
};

// Get quiz with questions
exports.getQuizWithQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: { id: Number(quizId) },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    console.error('Error retrieving quiz:', error);
    res.status(500).json({ error: 'Failed to get quiz' });
  }
};
