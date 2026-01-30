const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  period: String,
  location: [Number],
  year: Number,
  image: String,
  summary: String
});

module.exports = mongoose.model('Battle', battleSchema);