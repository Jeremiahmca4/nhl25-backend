
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const authRoutes = require("./routes/auth");
const teamRoutes = require("./routes/teams");
const tournamentRoutes = require("./routes/tournaments");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/tournaments", tournamentRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log("Server started on port " + PORT));
}).catch((err) => console.error("MongoDB connection error:", err));
