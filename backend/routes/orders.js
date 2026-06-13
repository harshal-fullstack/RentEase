const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Rental = require('../models/Rental');
const { protect, admin } = require('../middleware/auth');

// @desc    Create new order (Checkout)
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  const { items, shippingAddress, deliveryDate, deliverySlot } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'No items in order' });
  }

  try {
    // 1. Check Delivery Slot availability (Capacity Cap: 5 orders per slot/date)
    const formattedDate = new Date(deliveryDate);
    formattedDate.setHours(0,0,0,0);
    
    const ordersInSlot = await Order.countDocuments({
      deliveryDate: formattedDate,
      deliverySlot,
      status: { $ne: 'Cancelled' },
    });

    if (ordersInSlot >= 5) {
      return res.status(400).json({
        success: false,
        message: `The delivery slot "${deliverySlot}" is fully booked for ${formattedDate.toDateString()}. Please choose a different date or time slot.`,
      });
    }

    let totalMonthlyAmount = 0;
    let totalDeposit = 0;
    const verifiedItems = [];

    // 2. Verify products inventory and pricing
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product with ID ${item.productId} not found` });
      }

      if (product.inventory < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for ${product.name}. Available: ${product.inventory}, Requested: ${item.quantity}`,
        });
      }

      const pricePerMonth = product.pricing[item.tenure];
      if (!pricePerMonth) {
        return res.status(400).json({ success: false, message: `Invalid tenure ${item.tenure} for ${product.name}` });
      }

      const deposit = product.deposit;
      totalMonthlyAmount += pricePerMonth * item.quantity;
      totalDeposit += deposit * item.quantity;

      verifiedItems.push({
        product: product._id,
        tenure: item.tenure,
        quantity: item.quantity,
        pricePerMonth,
        deposit,
      });
    }

    // 3. Create the Order
    const order = await Order.create({
      user: req.user._id,
      items: verifiedItems,
      totalMonthlyAmount,
      totalDeposit,
      shippingAddress,
      city: shippingAddress.city,
      deliveryDate: formattedDate,
      deliverySlot,
      status: 'Scheduled', // Automatically scheduled if slot is free
    });

    // 4. Deduct Inventory
    for (const item of verifiedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { inventory: -item.quantity },
      });
    }

    return res.status(201).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('items.product');
    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/all
// @access  Private/Admin
router.get('/all', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 });
    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Deliver an order (Generate active rentals)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
// Note: We also allow users to self-deliver their orders in the development UI to easily demonstrate Steps 7 -> 8.
router.put('/:id/deliver', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'Delivered') {
      return res.status(400).json({ success: false, message: 'Order already delivered' });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot deliver a cancelled order' });
    }

    // Update order status
    order.status = 'Delivered';
    await order.save();

    const createdRentals = [];

    // Create Active Rental records for each item in the order
    for (const item of order.items) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(startDate.getMonth() + item.tenure);

      const rental = await Rental.create({
        user: order.user,
        order: order._id,
        product: item.product,
        tenure: item.tenure,
        quantity: item.quantity,
        pricePerMonth: item.pricePerMonth,
        deposit: item.deposit,
        startDate,
        endDate,
        status: 'Active',
      });

      createdRentals.push(rental);
    }

    return res.json({ success: true, message: 'Order marked as Delivered and active rentals established', rentals: createdRentals });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if user owns order or is admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (order.status === 'Delivered') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a delivered order' });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled' });
    }

    order.status = 'Cancelled';
    await order.save();

    // Restore inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { inventory: item.quantity },
      });
    }

    return res.json({ success: true, message: 'Order cancelled successfully', order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
