const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');
const Product = require('../models/Product');
const Maintenance = require('../models/Maintenance');
const { protect, admin } = require('../middleware/auth');

// @desc    Get user's active rentals
// @route   GET /api/rentals
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const rentals = await Rental.find({ user: req.user._id }).populate('product');
    return res.json({ success: true, count: rentals.length, rentals });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Extend a rental tenure
// @route   POST /api/rentals/:id/extend
// @access  Private
router.post('/:id/extend', protect, async (req, res) => {
  const { extendedTenure } = req.body; // e.g. 1, 3, 6, 12

  if (![1, 3, 6, 12].includes(Number(extendedTenure))) {
    return res.status(400).json({ success: false, message: 'Invalid extension tenure' });
  }

  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    if (rental.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (rental.status === 'Returned') {
      return res.status(400).json({ success: false, message: 'Cannot extend a rental that has already been returned' });
    }

    const oldEndDate = new Date(rental.endDate);
    const newEndDate = new Date(rental.endDate);
    newEndDate.setMonth(newEndDate.getMonth() + Number(extendedTenure));

    // Optional: Update pricing if user extends. We'll fetch the product and update the monthly price
    // to match the extended tenure pricing, or keep the old one. Let's update it to the new tenure price.
    const product = await Product.findById(rental.product);
    let newPrice = rental.pricePerMonth;
    if (product && product.pricing[extendedTenure]) {
      newPrice = product.pricing[extendedTenure];
    }

    rental.extensionHistory.push({
      extendedTenure: Number(extendedTenure),
      oldEndDate,
      newEndDate,
      extendedAt: new Date(),
    });

    rental.endDate = newEndDate;
    rental.pricePerMonth = newPrice;
    rental.status = 'Extended';

    await rental.save();

    return res.json({ success: true, message: 'Rental extended successfully', rental });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Schedule / Request a return pickup
// @route   POST /api/rentals/:id/return
// @access  Private
router.post('/:id/return', protect, async (req, res) => {
  const { pickupDate, pickupSlot } = req.body;

  if (!pickupDate || !pickupSlot) {
    return res.status(400).json({ success: false, message: 'Please provide a pickup date and slot' });
  }

  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    if (rental.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (rental.status === 'Returned') {
      return res.status(400).json({ success: false, message: 'Asset is already returned' });
    }

    rental.status = 'ReturnRequested';
    rental.returnDetails = {
      requestedAt: new Date(),
      pickupDate: new Date(pickupDate),
      pickupSlot,
    };

    await rental.save();

    return res.json({ success: true, message: 'Return pickup scheduled successfully', rental });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Raise a maintenance request
// @route   POST /api/rentals/:id/maintenance
// @access  Private
router.post('/:id/maintenance', protect, async (req, res) => {
  const { issueType, description, preferredDate, preferredSlot } = req.body;

  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    if (rental.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (rental.status === 'Returned') {
      return res.status(400).json({ success: false, message: 'Cannot file maintenance on a returned item' });
    }

    const ticket = await Maintenance.create({
      user: req.user._id,
      rental: rental._id,
      product: rental.product,
      issueType,
      description,
      preferredDate: new Date(preferredDate),
      preferredSlot,
    });

    return res.status(201).json({ success: true, message: 'Maintenance request submitted', ticket });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get user's maintenance tickets
// @route   GET /api/rentals/maintenance/user
// @access  Private
router.get('/maintenance/user', protect, async (req, res) => {
  try {
    const tickets = await Maintenance.find({ user: req.user._id }).populate('product');
    return res.json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all active rentals (Admin only)
// @route   GET /api/rentals/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate('user', 'name email')
      .populate('product')
      .sort({ createdAt: -1 });
    return res.json({ success: true, count: rentals.length, rentals });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all maintenance tickets (Admin only)
// @route   GET /api/rentals/maintenance/all
// @access  Private/Admin
router.get('/maintenance/all', protect, admin, async (req, res) => {
  try {
    const tickets = await Maintenance.find()
      .populate('user', 'name email')
      .populate('product')
      .populate('rental')
      .sort({ createdAt: -1 });
    return res.json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update maintenance ticket (Admin only)
// @route   PUT /api/rentals/maintenance/:id
// @access  Private/Admin
router.put('/maintenance/:id', protect, admin, async (req, res) => {
  const { status, adminNotes } = req.body;

  try {
    const ticket = await Maintenance.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (status) ticket.status = status;
    if (adminNotes !== undefined) ticket.adminNotes = adminNotes;

    await ticket.save();

    return res.json({ success: true, message: 'Ticket updated successfully', ticket });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Confirm return pickup (Admin only)
// @route   PUT /api/rentals/:id/return-complete
// @access  Private/Admin
router.put('/:id/return-complete', protect, admin, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    if (rental.status === 'Returned') {
      return res.status(400).json({ success: false, message: 'Rental already processed as returned' });
    }

    rental.status = 'Returned';
    rental.returnDetails.actualReturnDate = new Date();
    await rental.save();

    // Restock the product inventory
    await Product.findByIdAndUpdate(rental.product, {
      $inc: { inventory: rental.quantity },
    });

    return res.json({ success: true, message: 'Rental status marked as Returned and inventory restored', rental });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
