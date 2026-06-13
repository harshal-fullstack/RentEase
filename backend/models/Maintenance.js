const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rental: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rental',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  issueType: {
    type: String,
    enum: ['Damage', 'Malfunction', 'Replacement', 'General Service'],
    required: [true, 'Please select an issue type'],
  },
  description: {
    type: String,
    required: [true, 'Please add a detailed description of the issue'],
  },
  preferredDate: {
    type: Date,
    required: [true, 'Please select a preferred service date'],
  },
  preferredSlot: {
    type: String,
    enum: ['09:00 AM - 01:00 PM', '02:00 PM - 06:00 PM', '06:00 PM - 10:00 PM'],
    required: [true, 'Please select a preferred service slot'],
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Cancelled'],
    default: 'Open',
  },
  adminNotes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);
