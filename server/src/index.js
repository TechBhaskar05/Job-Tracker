import dotenv from 'dotenv';
import connectDB from './lib/db.js';
import { app } from './app.js';
import errorHandler from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import agentRoutes from './routes/agents.js';
import atsRoutes from './routes/ats.js';
import interviewRoutes from './routes/interview.js';
import quizRoutes from './routes/quiz.js';
import roadmapRoutes from './routes/roadmap.js';
import notificationRoutes from './routes/notifications.js';
import profileRoutes from './routes/profile.js';

dotenv.config({ path: './.env' });

const PORT = process.env.PORT || 8000;

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });