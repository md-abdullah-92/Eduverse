const express = require("express");
const app = express();

const cors = require('cors');

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const quizRoutes = require('./routes/quizRoutes');
const outcomeRoutes = require('./routes/outcomeRoutes');
const searchRoutes = require('./routes/searchRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const videoRoutes = require('./routes/videoRoutes');
const cartRoutes = require('./routes/cartRoutes');
const  studynoteRoutes = require('./routes/studynoteRoutes')
const assignmentRoutes = require('./routes/assignmentRoutes');
const qnaRoutes = require("./routes/qnaRoutes");
const teacherStatsRoutes = require("./routes/teacherStatsRoutes");

// Use routes as middleware
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/quizes', quizRoutes);
app.use('/api/outcomes', outcomeRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/studynote', studynoteRoutes);
app.use('/api/assignment', assignmentRoutes);
app.use("/api/qna", qnaRoutes);
app.use("/api/teacher-stats", teacherStatsRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Eduverse API!');
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
