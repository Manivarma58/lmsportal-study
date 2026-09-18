import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get('/api/apps/public/prod/public-settings/by-id/:id', (req, res) => {
  const { id } = req.params;
  res.json({ id, settings: { siteName: 'Demo LMS' } });
});

app.get('/api/apps/:appId/entities/User/me', (req, res) => {
  res.json({ id: 'user123', username: 'demo_user', email: 'demo@example.com' });
});

app.get('/api/apps/:appId/entities/User', (req, res) => {
  res.json([
    { id: 'user123', username: 'demo_user', email: 'demo@example.com' },
    { id: 'user456', username: 'student', email: 'student@example.com' }
  ]);
});

app.get('/api/apps/:appId/entities/Course', (req, res) => {
  res.json([
    { id: 'c1', title: 'Intro to Demo', created_date: Date.now() },
    { id: 'c2', title: 'Advanced Demo', created_date: Date.now() }
  ]);
});

app.get('/api/apps/:appId/entities/Enrollment', (req, res) => {
  res.json([
    { id: 'e1', userId: 'user123', courseId: 'c1' }
  ]);
});

app.post('/api/apps/:appId/analytics/track/batch', (req, res) => {
  res.status(200).json({ ok: true });
});

app.listen(PORT, () => console.log(`Mock API listening on http://localhost:${PORT}`));
