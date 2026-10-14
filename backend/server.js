require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require('./config/db');
const authRoute = require('./routes/authRoute');
const sessionRoute = require('./routes/sessionRoute');
const questionRoutes = require('./routes/questionRoute');
const { protect } = require("./middlewares/authMiddleware");
const { generateInterviewQuestions, generateConceptExplanation } = require("./controllers/aiController");

const app = express();

// Middleware to handle CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoute);
app.use("/api/sessions", sessionRoute);
app.use("/api/questions", questionRoutes);

app.use("/api/ai/generate-questions", protect, generateInterviewQuestions);
app.use("/api/ai/generate-explanation", protect, generateConceptExplanation);
 
// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health & Diagnostics endpoint
app.get("/api/health", (req, res) => {
  const isDbConnected = connectDB.getIsConnected ? connectDB.getIsConnected() : false;
  res.json({
    status: "ok",
    database: {
      connected: isDbConnected,
      mode: isDbConnected ? "mongodb" : "in-memory",
      error: connectDB.getConnectionError ? connectDB.getConnectionError() : null,
    },
    uptime: Math.floor(process.uptime()),
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));