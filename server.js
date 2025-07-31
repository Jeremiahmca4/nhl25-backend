
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(console.error);

// SCHEMAS
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  isAdmin: Boolean
});

const tournamentSchema = new mongoose.Schema({
  name: String,
  date: Date,
  code: String
});

const teamSchema = new mongoose.Schema({
  teamName: String,
  tournamentId: mongoose.Schema.Types.ObjectId,
  gamertag: String
});

const User = mongoose.model('User', userSchema);
const Tournament = mongoose.model('Tournament', tournamentSchema);
const Team = mongoose.model('Team', teamSchema);

// AUTH MIDDLEWARE
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// ROUTES

app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ error: 'User already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashed, isAdmin: false });
  await user.save();
  res.json({ message: 'User registered' });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(403).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
  res.json({ token });
});

app.post('/api/tournaments', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admins only' });
  const { name, date } = req.body;
  const code = Math.random().toString(36).substr(2, 6).toUpperCase();
  const tournament = new Tournament({ name, date, code });
  await tournament.save();
  res.json({ message: 'Tournament created', code });
});

app.post('/api/register-team', authenticateToken, async (req, res) => {
  const { teamName, tournamentId, gamertag } = req.body;
  const existing = await Team.findOne({ gamertag });
  if (existing) return res.status(400).json({ error: 'Gamertag already registered' });
  const team = new Team({ teamName, tournamentId, gamertag });
  await team.save();
  res.json({ message: 'Team registered' });
});

app.get('/api/users', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admins only' });
  const users = await User.find();
  res.json(users);
});

app.get('/api/teams', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admins only' });
  const teams = await Team.find();
  res.json(teams);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
