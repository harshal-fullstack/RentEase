const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
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
    min: 1,
  },
  pricePerMonth: {
    type: Number,
    required: true,
  },
  deposit: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema],
  totalMonthlyAmount: {
    type: Number,
    required: true,
  },
  totalDeposit: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true }, // The city user input during checkout
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  city: {
    type: String,
    required: true, // For operational scaling
  },
  deliveryDate: {
    type: Date,
    required: true,
  },
  deliverySlot: {
    type: String,
    enum: ['09:00 AM - 01:00 PM', '02:00 PM - 06:00 PM', '06:00 PM - 10:00 PM'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Scheduled', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', orderSchema);
