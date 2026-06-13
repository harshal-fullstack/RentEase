const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Furniture', 'Appliances'],
  },
  subCategory: {
    type: String,
    required: [true, 'Please add a subcategory'], // e.g. Bed, Sofa, Table, Fridge, TV, Washer
  },
  imageUrl: {
    type: String,
    required: [true, 'Please add an image URL'],
  },
  pricing: {
    1: { type: Number, required: true }, // Monthly price for 1 month tenure
    3: { type: Number, required: true }, // Monthly price for 3 months tenure
    6: { type: Number, required: true }, // Monthly price for 6 months tenure
    12: { type: Number, required: true }, // Monthly price for 12 months tenure
  },
  deposit: {
    type: Number,
    required: [true, 'Please add a security deposit amount'],
  },
  inventory: {
    type: Number,
    required: [true, 'Please add the total inventory count'],
    min: 0,
  },
  city: {
    type: String,
    default: 'All', // To support multi-city scaling (e.g. 'New York', 'San Francisco')
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
