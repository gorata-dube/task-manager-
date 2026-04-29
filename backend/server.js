const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { initDatabase, run, get, all } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-before-deployment';

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS. Add this frontend URL to FRONTEND_URL.'));
  },
  credentials: true
}));

app.use(express.json());

function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

function cleanUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function cleanTask(task) {
  return {
    ...task,
    completed: Boolean(task.completed)
  };
}

async function authRequired(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) return res.status(401).json({ message: 'Please login first.' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await get('SELECT id, name, email FROM users WHERE id = ?', [decoded.id]);

    if (!user) return res.status(401).json({ message: 'Account not found.' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired login. Please login again.' });
  }
}

app.get('/', (req, res) => {
  res.json({ message: 'Nova Task Manager API is running.' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'sqlite' });
});

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existingUser = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) return res.status(409).json({ message: 'Email already registered. Please login.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await run(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );

    const user = await get('SELECT id, name, email FROM users WHERE id = ?', [result.lastID]);
    const token = createToken(user);

    res.status(201).json({ user: cleanUser(user), token });
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

    const correctPassword = await bcrypt.compare(password, user.password_hash);
    if (!correctPassword) return res.status(401).json({ message: 'Invalid email or password.' });

    const token = createToken(user);
    res.json({ user: cleanUser(user), token });
  } catch (err) {
    next(err);
  }
});

app.get('/api/auth/me', authRequired, (req, res) => {
  res.json({ user: cleanUser(req.user) });
});

app.get('/api/tasks', authRequired, async (req, res, next) => {
  try {
    const tasks = await all(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY completed ASC, id DESC',
      [req.user.id]
    );
    res.json(tasks.map(cleanTask));
  } catch (err) {
    next(err);
  }
});

app.get('/api/tasks/:id', authRequired, async (req, res, next) => {
  try {
    const task = await get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json(cleanTask(task));
  } catch (err) {
    next(err);
  }
});

app.post('/api/tasks', authRequired, async (req, res, next) => {
  try {
    const title = String(req.body.title || '').trim();
    const description = String(req.body.description || '').trim();
    const dueDate = String(req.body.due_date || '').trim();
    const priority = String(req.body.priority || 'Normal').trim();

    if (!title) return res.status(400).json({ message: 'Task title is required.' });

    const result = await run(
      'INSERT INTO tasks (user_id, title, description, due_date, priority, completed) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, title, description, dueDate, priority, 0]
    );

    const task = await get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [result.lastID, req.user.id]);
    res.status(201).json(cleanTask(task));
  } catch (err) {
    next(err);
  }
});

app.put('/api/tasks/:id', authRequired, async (req, res, next) => {
  try {
    const existingTask = await get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!existingTask) return res.status(404).json({ message: 'Task not found.' });

    const title = req.body.title !== undefined ? String(req.body.title).trim() : existingTask.title;
    const description = req.body.description !== undefined ? String(req.body.description).trim() : existingTask.description;
    const dueDate = req.body.due_date !== undefined ? String(req.body.due_date).trim() : existingTask.due_date;
    const priority = req.body.priority !== undefined ? String(req.body.priority).trim() : existingTask.priority;
    const completed = req.body.completed !== undefined ? (req.body.completed ? 1 : 0) : existingTask.completed;

    if (!title) return res.status(400).json({ message: 'Task title is required.' });

    await run(
      `UPDATE tasks
       SET title = ?, description = ?, due_date = ?, priority = ?, completed = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [title, description, dueDate, priority, completed, req.params.id, req.user.id]
    );

    const updatedTask = await get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json(cleanTask(updatedTask));
  } catch (err) {
    next(err);
  }
});

app.delete('/api/tasks/:id', authRequired, async (req, res, next) => {
  try {
    const result = await run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (result.changes === 0) return res.status(404).json({ message: 'Task not found.' });
    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

app.use((err, req, res, next) => {
  console.error(err);
  if (err.message && err.message.includes('CORS')) return res.status(403).json({ message: err.message });
  res.status(500).json({ message: 'Server error. Please try again.' });
});

initDatabase()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => {
    console.error('Database startup failed:', err.message);
    process.exit(1);
  });
