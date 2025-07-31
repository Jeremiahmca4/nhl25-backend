
const mongoose = require("mongoose");
const teamSchema = new mongoose.Schema({
  teamName: String,
  captainEmail: String,
  tournamentId: mongoose.Schema.Types.ObjectId,
  gamertags: [String]
});
module.exports = mongoose.model("Team", teamSchema);
