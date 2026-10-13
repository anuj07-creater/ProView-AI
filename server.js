import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const connectDB = require('./backend/config/db');
const authRoute = require('./backend/routes/authRoute');
const sessionRoute = require('./backend/routes/sessionRoute');
const questionRoutes = require('./backend/routes/questionRoute');
const { protect } = require('./backend/middlewares/authMiddleware');
const { generateInterviewQuestions, generateConceptExplanation } = require('./backend/controllers/aiController');

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'backend', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Connect DB (handles MongoDB if provided, or initializes in-memory store)
connectDB();

app.use(express.json());

// API Routes
app.use('/api/auth', authRoute);
app.use('/api/sessions', sessionRoute);
app.use('/api/questions', questionRoutes);
app.use('/api/ai/generate-questions', protect, generateInterviewQuestions);
app.use('/api/ai/generate-explanation', protect, generateConceptExplanation);

// Static uploads
app.use('/uploads', express.static(uploadsDir));

// Mongoose offline fallback error middleware
app.use((err, req, res, next) => {
  if (
    err.name === 'MongooseError' ||
    err.name === 'MongoNetworkError' ||
    (err.message && err.message.includes('buffering timed out'))
  ) {
    console.warn('[AI Studio] Database offline — returning fallback');
    if (req.method === 'GET') {
      return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {});
    }
    return res.status(503).json({ error: 'Service temporarily unavailable (database offline)' });
  }
  next(err);
});

// Frontend Vite integration (SPA)
const isProduction = process.env.NODE_ENV === 'production';
const distPath = path.resolve(__dirname, 'dist');

if (!isProduction && !fs.existsSync(path.join(distPath, 'index.html'))) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
    root: path.resolve(__dirname, 'frontend', 'interview-prep-app'),
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} (0.0.0.0:${PORT})`);
});
