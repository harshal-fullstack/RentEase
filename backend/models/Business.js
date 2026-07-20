const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a business name'],
    trim: true,
  },
  skillType: {
    type: String,
    required: [true, 'Please add a skill type'], // e.g. Delivery, Repair, Maintenance
  },
  servicesOffered: {
    type: [String],
    required: [true, 'Please add services offered'],
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  pricing: {
    type: Number,
    required: [true, 'Please add pricing'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Business', businessSchema);
