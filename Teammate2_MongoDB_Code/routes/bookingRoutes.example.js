// EXAMPLE only: merge these ownership patterns into your existing booking routes.
// Assumes Booking model has a `userId` field referencing User.
// Do not mount duplicate endpoints; adapt route paths to your project.
const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// USER sees only their own bookings. The owner filter is part of the DB query.
router.get('/my', protect, authorizeRoles('USER'), async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) { next(err); }
});

// Cancel only a booking belonging to the logged-in user.
// Use the actual cancellation field/logic from your Booking schema.
router.delete('/:bookingId', protect, authorizeRoles('USER'), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID.' });
    }
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      userId: req.user.id,
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    // Replace with your project's actual cancellation logic.
    booking.status = 'CANCELLED';
    await booking.save();
    return res.json({ booking });
  } catch (err) { next(err); }
});

module.exports = router;
