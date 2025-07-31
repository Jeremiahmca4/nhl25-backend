
const mongoose = require("mongoose");
const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true }
});
module.exports = mongoose.model("Tournament", tournamentSchema);
