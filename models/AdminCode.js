
const mongoose = require("mongoose");
const adminCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }
});
module.exports = mongoose.model("AdminCode", adminCodeSchema);
