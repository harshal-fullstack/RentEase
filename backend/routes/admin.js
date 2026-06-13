const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Rental = require('../models/Rental');
const Maintenance = require('../models/Maintenance');
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

module.exports = router;
