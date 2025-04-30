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

// Use routes as middleware
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/quizes', quizRoutes);
app.use('/api/outcomes', outcomeRoutes);
app.use('/api/search', searchRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Eduverse API!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
