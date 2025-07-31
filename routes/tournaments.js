
const express = require("express");
const jwt = require("jsonwebtoken");
const Tournament = require("../models/Tournament");
const router = express.Router();

router.get("/", async (req, res) => {
  const tournaments = await Tournament.find();
  res.json(tournaments);
});

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
  if (!req.user.isAdmin) return res.status(403).json({ error: "Forbidden" });
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });
  const tournament = await Tournament.create({ name });
  res.json(tournament);
});

module.exports = router;
