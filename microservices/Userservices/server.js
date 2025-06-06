const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const userRoutes = require("./routes/userRoutes");
const quizRoutes = require('./routes/quiz.routes');
const assignmentRoutes = require('./routes/assignment.routes');
const studynoteRoutes = require('./routes/studynote.routes');

dotenv.config();
const app = express();

app.use(cors({
  origin: (origin, callback) => {
    callback(null, origin); // Reflect the origin back
  },
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/user", userRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/assignment', assignmentRoutes);
app.use('/api/studynote', studynoteRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));







