const prisma = require('../prismaClient');
// 1. Ask a new question (Student)
exports.askQuestion = async (req, res) => {
  try {
    const { studentId, studentName, studentPhotoUrl, title, content, courseId } = req.body;

    const question = await prisma.studentQuestion.create({
      data: {
        studentId,
        studentName,
        studentPhotoUrl,
        title,
        content,
        courseId,
      },
    });

    res.status(201).json({ message: "Question submitted", question });
  } catch (error) {
    console.error("Ask Question Error:", error);
    res.status(500).json({ error: "Failed to submit question" });
  }
};

// 2. Get all questions for a course
exports.getQuestionsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const questions = await prisma.studentQuestion.findMany({
      where: { courseId: parseInt(courseId) },
      include: { answer: true },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(questions);
  } catch (error) {
    console.error("Get Questions Error:", error);
    res.status(500).json({ error: "Failed to get questions" });
  }
};

// 3. Get a single question by ID
exports.getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await prisma.studentQuestion.findUnique({
      where: { id },
      include: { answer: true },
    });

    if (!question) return res.status(404).json({ error: "Question not found" });

    res.status(200).json(question);
  } catch (error) {
    console.error("Get Question Error:", error);
    res.status(500).json({ error: "Failed to get question" });
  }
};

// 4. Submit an answer (Teacher)
exports.answerQuestion = async (req, res) => {
  try {
    const { questionId, content, teacherId, teacherName, teacherPhotoUrl } = req.body;

    // Validate required fields
    if (!questionId || !content || !teacherId || !teacherName) {
      console.log(questionId, content, teacherId, teacherName, teacherPhotoUrl);
      console.error("Missing required fields for answer");
      return res.status(400).json({ error: "Missing required fields." });

    }

    // Check if already answered
    const existing = await prisma.teacherAnswer.findUnique({
      where: { questionId },
    });

    if (existing) {
      return res.status(400).json({ error: "This question has already been answered." });
    }

    // Create the answer
    const answer = await prisma.teacherAnswer.create({
      data: {
        content,
        teacherId,
        teacherName,
        teacherPhotoUrl,
        questionId,
      },
    });

    // Mark the question as answered
    await prisma.studentQuestion.update({
      where: { id: questionId },
      data: { isAnswered: true },
    });

    res.status(201).json({ message: "Answer submitted successfully.", answer });
  } catch (error) {
    console.error("Answer Question Error:", error);
    res.status(500).json({ error: "Failed to submit answer. Please try again later." });
  }
};


// 5. Get all unanswered questions for a course
exports.getUnansweredQuestions = async (req, res) => {
  try {
    const { courseId } = req.params;

    const questions = await prisma.studentQuestion.findMany({
      where: {
        courseId: parseInt(courseId),
        isAnswered: false,
      },
    });

    res.status(200).json(questions);
  } catch (error) {
    console.error("Get Unanswered Questions Error:", error);
    res.status(500).json({ error: "Failed to get unanswered questions" });
  }
};

// 6. Get all answered questions for a course
exports.getAnsweredQuestions = async (req, res) => {
  try {
    const { courseId } = req.params;

    const questions = await prisma.studentQuestion.findMany({
      where: {
        courseId: parseInt(courseId),
        isAnswered: true,
      },
      include: { answer: true },
    });

    res.status(200).json(questions);
  } catch (error) {
    console.error("Get Answered Questions Error:", error);
    res.status(500).json({ error: "Failed to get answered questions" });
  }
};

// 7. Optional: Get questions asked by a student
exports.getQuestionsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const questions = await prisma.studentQuestion.findMany({
      where: { studentId: parseInt(studentId) },
      include: { answer: true },
    });

    res.status(200).json(questions);
  } catch (error) {
    console.error("Get Student Questions Error:", error);
    res.status(500).json({ error: "Failed to get student questions" });
  }
};
