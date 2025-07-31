
const express = require("express");
const jwt = require("jsonwebtoken");
const Team = require("../models/Team");
const router = express.Router();

router.use((req, res, next) => {
  const auth = req.headers.authorization?.split(" ")[1];
  if (!auth) return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(auth, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
});

router.post("/", async (req, res) => {
  const { teamName, tournamentId, gamertags } = req.body;
  if (!teamName || !tournamentId || !gamertags?.length) return res.status(400).json({ error: "Missing fields" });

  const existing = await Team.findOne({ tournamentId, teamName });
  if (existing) return res.status(400).json({ error: "Team already exists in this tournament" });

  const existingTags = await Team.findOne({ tournamentId, gamertags: { $in: gamertags } });
  if (existingTags) return res.status(400).json({ error: "One or more gamertags already registered" });

  const teamCount = await Team.countDocuments({ tournamentId });
  if (teamCount >= 16) return res.status(400).json({ error: "Tournament full" });

  const team = await Team.create({ teamName, tournamentId, gamertags, captainEmail: req.user.id });
  res.json(team);
});

router.get("/", async (req, res) => {
  if (req.user.isAdmin) {
    const teams = await Team.find();
    return res.json(teams);
  } else {
    const teams = await Team.find({ captainEmail: req.user.id });
    return res.json(teams);
  }
});

module.exports = router;
