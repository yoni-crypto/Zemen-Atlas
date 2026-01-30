const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: String,
  period: String,
  location: [Number],
  startYear: Number,
  endYear: Number,
  image: String,
  summary: String
});

module.exports = mongoose.model('Place', placeSchema);