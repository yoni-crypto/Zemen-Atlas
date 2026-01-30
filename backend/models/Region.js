const mongoose = require('mongoose');

const regionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dynasty: String,
  period: String,
  color: String,
  activeYears: [Number],
  bounds: [[Number]],
  summary: String
});

module.exports = mongoose.model('Region', regionSchema);