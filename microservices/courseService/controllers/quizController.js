const prisma = require('../prismaClient');

// Create a quiz for a lesson
exports.createQuiz = async (req, res) => {
  const { lessonId } = req.params;

  try {
    const quiz = await prisma.quiz.create({
      data: {
        lessonId: parseInt(lessonId),
      },
    });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create quiz', details: error.message });
  }
};

// Get quiz of a lesson
exports.getLessonQuiz = async (req, res) => {
  const { lessonId } = req.params;

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { lessonId: parseInt(lessonId) },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });

    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quiz', details: error.message });
  }
};

// Create a question with options for a quiz
exports.createQuestion = async (req, res) => {
  const { lessonId } = req.params;
  const { text, options } = req.body;

  try {
    const question = await prisma.question.create({
      data: {
        text,
        quiz: {
          connect: { lessonId: parseInt(lessonId) }, // explicitly connect to Quiz via lessonId
        },
        options: {
          create: options, // [{ text: "Option 1", isCorrect: false }, ...]
        },
      },
      include: { options: true },
    });

    res.json(question);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to create question', details: error.message });
  }
};

// Get all questions and options of a quiz
exports.getQuizQuestions = async (req, res) => {
  const { lessonId } = req.params;

  try {
    const questions = await prisma.question.findMany({
      where: { quiz: { lessonId: parseInt(lessonId) } },
      include: { options: true },
    });

    res.json(questions);  
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions', details: error.message });
  }
};

// Update a question 
exports.updateQuestion = async (req, res) => {
  const { questionId } = req.params;
  const { text, options } = req.body;

  try {
    const updated = await prisma.question.update({
      where: { id: parseInt(questionId) },
      data: {
        text,
        options: {
          deleteMany: {}, // delete all existing options
          create: options // create new options
        }
      },
      include: {
        options: true
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update question', details: error.message });
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
    res.status(500).json({ error: 'Failed to delete question', details: error.message });
  }
};

// create a quiz
// hit -> post -> http://localhost:5000/api/quizes/create/:lessonId


// get lesson quiz
// hit -> get -> http://localhost:5000/api/quizes/get/:lessonId


// create a question
// hit -> post -> http://localhost:5000/api/quizes/addQuestion/:lessonId
// request body -> 
  // {
  //   "text": "What is the capital of France?",
  //   "options": [
  //     { "text": "Paris", "isCorrect": true },
  //     { "text": "Berlin", "isCorrect": false },
  //     { "text": "Madrid", "isCorrect": false },
  //     { "text": "Rome", "isCorrect": false }
  //   ]
  // }


// update a question
// hit -> put -> http://localhost:5000/api/quizes/update/:questionId
// request body -> 
  // {
  //   "text": "What is the capital of France?",
  //   "options": [
  //     { "text": "Paris", "isCorrect": true },
  //     { "text": "Mexico", "isCorrect": false },
  //     { "text": "Madrid", "isCorrect": false },
  //     { "text": "Rome", "isCorrect": false }
  //   ]
  // }

// delete a question
// hit -> delete -> http://localhost:5000/api/quizes/delete/:questionId

// get all questions of a lesson
// hit -> get -> http://localhost:5000/api/quizes/getQuestions/:lessonId
