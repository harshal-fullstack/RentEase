const mongoose = require('mongoose');

const serviceAreaSchema = new mongoose.Schema({
  cityName: {
    type: String,
    required: [true, 'Please add a city name'],
    unique: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ServiceArea', serviceAreaSchema);
