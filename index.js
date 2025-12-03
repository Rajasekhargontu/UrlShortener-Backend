import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDB from './db.js';
import authRoutes from './routes/auth.js'; 
import linkRoutes from './routes/links.js';
import analyticsRoutes from './routes/analytics.js';
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());
// Health
app.get('/', (req, res) => res.send('Welcome to Home Page'));
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'internal' });
});

try {
  await connectDB();
} catch (err) {
  console.error('Startup error', err);
  process.exit(1);
}
// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
export default app;
