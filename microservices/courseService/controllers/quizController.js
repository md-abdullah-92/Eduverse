const prisma = require('../prismaClient');

// @desc    Create a new quiz
// @route   POST /api/quizes
// @access  Private
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, duration, lessonId, questions } = req.body;

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        duration,
        lesson: {
          connect: { id: lessonId },
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
        lesson: true
      },
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).json({ error: "Failed to create quiz" });
  }
};

// @desc    Get all quizzes
// @route   GET /api/quizes
// @access  Public
exports.getQuizzes = async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        lesson: true,
        questions: true
      }
    });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quizzes',
      details: error.message
    });
  }
};

// @desc    Get single quiz
// @route   GET /api/quizes/:id
// @access  Public
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        lesson: true,
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: `Quiz not found with id of ${req.params.id}`
      });
    }


    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quiz',
      details: error.message
    });
  }
};

// @desc    Update quiz
// @route   PUT /api/quizes/:id
// @access  Private
exports.updateQuiz = async (req, res) => {
  try {
    const { title, description, timeLimit, passingScore, isPublished } = req.body;
    
    // Check if quiz exists
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!existingQuiz) {
      return res.status(404).json({
        success: false,
        error: `Quiz not found with id of ${req.params.id}`
      });
    }

    const updatedQuiz = await prisma.quiz.update({
      where: { id: parseInt(req.params.id) },
      data: {
        title,
        description,
        timeLimit: timeLimit ? parseInt(timeLimit) : undefined,
        passingScore: passingScore ? parseInt(passingScore) : undefined,
        isPublished: isPublished !== undefined ? isPublished : undefined,
        updatedAt: new Date()
      },
      include: {
        lesson: true
      }
    });

    res.status(200).json({
      success: true,
      data: updatedQuiz
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update quiz',
      details: error.message
    });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizes/:id
// @access  Private
exports.deleteQuiz = async (req, res) => {
  try {
    // Check if quiz exists
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!existingQuiz) {
      return res.status(404).json({
        success: false,
        error: `Quiz not found with id of ${req.params.id}`
      });
    }

    // Delete related questions and options first
    await prisma.question.deleteMany({
      where: { quizId: parseInt(req.params.id) }
    });

    // Then delete the quiz
    await prisma.quiz.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete quiz',
      details: error.message
    });
  }
};

// @desc    Save complete quiz with questions and options
// @route   POST /api/quizes/save/:lessonId
// @access  Private
exports.saveCompleteQuiz = async (req, res) => {
  const { lessonId } = req.params;
  const { questions, marks } = req.body;

  try {
    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (prisma) => {
      // Create the quiz
      const quiz = await prisma.quiz.create({
        data: {
          lessonId: parseInt(lessonId),
          marks: parseInt(marks) || 0
        },
      });

      // Create questions with their options
      const createdQuestions = await Promise.all(
        questions.map(async (q) => {
          const question = await prisma.question.create({
            data: {
              question: q.question, // Using 'question' as per Prisma model
              type: q.type || 'MCQ',
              explanation: q.explanation || '',
              difficulty: q.difficulty || 'EASY',
              quiz: {
                connect: { lessonId: parseInt(lessonId) }
              },
              options: {
                create: (q.options || []).map(opt => ({
                  text: opt.text,
                  isCorrect: opt.isCorrect || false
                }))
              }
            },
            include: {
              options: true
            }
          });
          return question;
        })
      );

      return { quiz, questions: createdQuestions };
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error saving quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save quiz',
      details: error.message
    });
  }
};

// @desc    Get quiz by lesson ID
// @route   GET /api/quizes/lesson/:lessonId
// @access  Public
exports.getQuizzesByLessonId = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const quizzes = await prisma.quiz.findMany({
      where: { lessonId: Number(lessonId) },
      include: {
        questions: true,
      },
    });

    res.json(quizzes);
  } catch (error) {
    console.error('Error retrieving quizzes:', error);
    res.status(500).json({ error: 'Failed to get quizzes' });
  }
};

// @desc    Create a question with options
// @route   POST /api/quizes/:quizId/questions
// @access  Private
exports.createQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { text: questionText, type, explanation, difficulty, options } = req.body;

    const question = await prisma.question.create({
      data: {
        question: questionText, // Using 'question' as per Prisma model
        type: type || 'MCQ',
        explanation: explanation || '',
        difficulty: difficulty || 'EASY',
        quiz: {
          connect: { lessonId: parseInt(quizId) }
        },
        options: {
          create: (options || []).map(opt => ({
            text: opt.text,
            isCorrect: opt.isCorrect || false
          }))
        }
      },
      include: {
        options: true
      }
    });

    res.status(201).json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create question',
      details: error.message
    });
  }
};

// @desc    Update a question
// @route   PUT /api/quizes/questions/:questionId
// @access  Private
exports.updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { text: questionText, type, explanation, difficulty } = req.body;

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: parseInt(questionId) }
    });

    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        error: `Question not found with id ${questionId}`
      });
    }

    const updateData = {
      type,
      explanation,
      difficulty,
      updatedAt: new Date()
    };

    // Only update question text if provided
    if (questionText !== undefined) {
      updateData.question = questionText;
    }

    const updatedQuestion = await prisma.question.update({
      where: { id: parseInt(questionId) },
      data: updateData,
      include: {
        options: true
      }
    });

    res.status(200).json({
      success: true,
      data: updatedQuestion
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update question',
      details: error.message
    });
  }
};

// Delete a question and its options
exports.deleteQuestion = async (req, res) => {
  const { questionId } = req.params;

  try {
    await prisma.option.deleteMany({ where: { questionId: parseInt(questionId) } });
    await prisma.question.delete({ where: { id: parseInt(questionId) } });

    res.json({ message: 'Question and its options deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to delete question', 
      details: error.message 
    });
  }
};
