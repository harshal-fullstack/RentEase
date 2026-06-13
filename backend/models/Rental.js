const mongoose = require('mongoose');

const extensionSchema = new mongoose.Schema({
  extendedTenure: {
    type: Number,
    enum: [1, 3, 6, 12],
    required: true,
  },
  oldEndDate: {
    type: Date,
    required: true,
  },
  newEndDate: {
    type: Date,
    required: true,
  },
  extendedAt: {
    type: Date,
    default: Date.now,
  },
});

const rentalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  tenure: {
    type: Number,
    enum: [1, 3, 6, 12],
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  pricePerMonth: {
    type: Number,
    required: true,
  },
  deposit: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Extended', 'ReturnRequested', 'Returned'],
    default: 'Active',
  },
  extensionHistory: [extensionSchema],
  returnDetails: {
    requestedAt: { type: Date },
    pickupDate: { type: Date },
    pickupSlot: { type: String },
    actualReturnDate: { type: Date },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Rental', rentalSchema);
