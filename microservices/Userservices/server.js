const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => callback(null, origin), // Reflect the origin
  credentials: true
}));
app.use(express.json());

// Route Imports
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const userRoutes = require("./routes/userRoutes");
const quizRoutes = require("./routes/quiz.routes");
const assignmentRoutes = require("./routes/assignment.routes");
const studynoteRoutes = require("./routes/studynote.routes");
const resultRoutes = require("./routes/result.routes"); // ✅ Add this line

// Route Bindings
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/user", userRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/assignment", assignmentRoutes);
app.use("/api/studynote", studynoteRoutes);
app.use("/api/result", resultRoutes); // ✅ Add this line

// Fallback route
app.use((req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
