
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const AdminCode = require("../models/AdminCode");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password, adminCode } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: "Missing fields" });

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ error: "User already exists" });

  const isAdmin = adminCode === process.env.ADMIN_CODE || await AdminCode.findOne({ code: adminCode });

  if (adminCode && adminCode !== process.env.ADMIN_CODE && !isAdmin) {
    return res.status(400).json({ error: "Invalid admin code" });
  }

  if (isAdmin && adminCode !== process.env.ADMIN_CODE) {
    await AdminCode.deleteOne({ code: adminCode });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password: hashedPassword, isAdmin: !!isAdmin });

  res.json({ message: "User registered" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.email, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
  res.json({ token });
});

router.post("/generate-admin-code", async (req, res) => {
  const auth = req.headers.authorization?.split(" ")[1];
  const decoded = jwt.verify(auth, process.env.JWT_SECRET);
  if (!decoded.isAdmin) return res.status(403).json({ error: "Forbidden" });

  const newCode = Math.random().toString(36).substring(2, 10);
  await AdminCode.create({ code: newCode });
  res.json({ code: newCode });
});

module.exports = router;
