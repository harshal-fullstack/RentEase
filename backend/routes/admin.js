const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Rental = require('../models/Rental');
const Maintenance = require('../models/Maintenance');
const Business = require('../models/Business');
const ServiceArea = require('../models/ServiceArea');
const { protect, admin } = require('../middleware/auth');

// @desc    Get dashboard metrics (MRR, Utilization, active orders/tickets counts)
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
  try {
    // 1. Get active rentals (status in Active, Extended, ReturnRequested)
    const activeRentals = await Rental.find({
      status: { $in: ['Active', 'Extended', 'ReturnRequested'] },
    });

    // 2. Calculate Monthly Recurring Revenue (MRR)
    let mrr = 0;
    let rentedAssetsCount = 0;
    activeRentals.forEach((r) => {
      mrr += r.pricePerMonth * r.quantity;
      rentedAssetsCount += r.quantity;
    });

    // 3. Calculate Asset Utilization Rate
    // Formula: Rented Units / (Rented Units + Available Units)
    const products = await Product.find();
    let availableAssetsCount = 0;
    products.forEach((p) => {
      availableAssetsCount += p.inventory;
    });

    const totalAssets = rentedAssetsCount + availableAssetsCount;
    const utilizationRate = totalAssets > 0 ? (rentedAssetsCount / totalAssets) * 100 : 0;

    // 4. General Counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalOrders = await Order.countDocuments();
    const activeOrders = await Order.countDocuments({ status: 'Scheduled' });
    
    // 5. Maintenance Tickets Counts
    const openMaintenance = await Maintenance.countDocuments({ status: { $in: ['Open', 'In Progress'] } });
    const resolvedMaintenance = await Maintenance.countDocuments({ status: 'Resolved' });

    // 6. Return Request logs
    const returnRequestsCount = await Rental.countDocuments({ status: 'ReturnRequested' });

    return res.json({
      success: true,
      stats: {
        mrr,
        utilizationRate: Math.round(utilizationRate * 10) / 10, // Round to 1 decimal place
        rentedAssetsCount,
        availableAssetsCount,
        totalUsers,
        totalOrders,
        activeOrders, // Scheduled deliveries
        openMaintenance,
        resolvedMaintenance,
        returnRequestsCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all business partners (vendors)
// @route   GET /api/admin/businesses
// @access  Private/Admin
router.get('/businesses', protect, admin, async (req, res) => {
  try {
    const businesses = await Business.find({}).populate('products').sort({ name: 1 });
    return res.json({ success: true, count: businesses.length, businesses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all service areas
// @route   GET /api/admin/service-areas
// @access  Public
router.get('/service-areas', async (req, res) => {
  try {
    const serviceAreas = await ServiceArea.find({}).sort({ cityName: 1 });
    return res.json({ success: true, count: serviceAreas.length, serviceAreas });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create service area
// @route   POST /api/admin/service-areas
// @access  Private/Admin
router.post('/service-areas', protect, admin, async (req, res) => {
  const { cityName, isActive } = req.body;
  try {
    const area = await ServiceArea.create({ cityName, isActive });
    return res.status(201).json({ success: true, serviceArea: area });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Update service area
// @route   PUT /api/admin/service-areas/:id
// @access  Private/Admin
router.put('/service-areas/:id', protect, admin, async (req, res) => {
  const { cityName, isActive } = req.body;
  try {
    const area = await ServiceArea.findById(req.params.id);
    if (!area) {
      return res.status(404).json({ success: false, message: 'Service area not found' });
    }
    if (cityName !== undefined) area.cityName = cityName;
    if (isActive !== undefined) area.isActive = isActive;
    await area.save();
    return res.json({ success: true, serviceArea: area });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Delete service area
// @route   DELETE /api/admin/service-areas/:id
// @access  Private/Admin
router.delete('/service-areas/:id', protect, admin, async (req, res) => {
  try {
    const area = await ServiceArea.findById(req.params.id);
    if (!area) {
      return res.status(404).json({ success: false, message: 'Service area not found' });
    }
    await ServiceArea.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Service area deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
