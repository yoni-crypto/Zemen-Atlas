const mongoose = require('mongoose');

const rulerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  title: String,
  period: String,
  location: [Number],
  startYear: Number,
  endYear: Number,
  image: String,
  summary: String
});

module.exports = mongoose.model('Ruler', rulerSchema);