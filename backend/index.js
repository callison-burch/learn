const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const {
  assignments,
  templates,
  createAssignment,
} = require('./assignments');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

const users = [];
const SECRET_KEY = 'super_secret_jwt_key';

// In-memory data stores
const courses = [];
const activities = [];

function logActivity(message) {
  activities.push({
    id: activities.length + 1,
    message,
    timestamp: Date.now(),
  });
}

async function createUser(username, password, role = 'Student') {
  const hashed = await bcrypt.hash(password, 10);
  const user = { username, password: hashed, role };
  users.push(user);
  return user;
}

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });
  try {
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function authorize(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
}

app.post('/signup', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  const existing = users.find(u => u.username === username);
  if (existing) {
    return res.status(400).json({ error: 'User already exists' });
  }
  const user = await createUser(username, password, role);
  res.json({ message: 'User created', user: { username: user.username, role: user.role } });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
  req.session.user = { username: user.username, role: user.role };
  res.json({ token });
});

app.get('/profile', authenticate, (req, res) => {
  res.json({ user: req.user });
});

app.get('/instructor', authenticate, authorize('Instructor'), (req, res) => {
  res.json({ message: 'Welcome Instructor' });
});

app.get('/student', authenticate, authorize('Student'), (req, res) => {
  res.json({ message: 'Welcome Student' });
});

// List all courses with metrics
app.get('/courses', (req, res) => {
  res.json(courses);
});

// Create a new course
app.post('/courses', (req, res) => {
  const { name, studentCount = 0 } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name required' });
  }
  const course = { id: String(courses.length + 1), name, studentCount };
  courses.push(course);
  logActivity(`Course created: ${name}`);
  res.json(course);
});

// Edit an existing course
app.put('/courses/:id', (req, res) => {
  const course = courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Not found' });
  const { name, studentCount } = req.body;
  if (name !== undefined) course.name = name;
  if (studentCount !== undefined) course.studentCount = studentCount;
  logActivity(`Course updated: ${course.name}`);
  res.json(course);
});

// Activity feed
app.get('/activities', (req, res) => {
  res.json(activities.slice(-50));
});

app.listen(3000, () => console.log('Server running on port 3000'));
