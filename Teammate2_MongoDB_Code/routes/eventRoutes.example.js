// EXAMPLE only: merge these ownership patterns into your existing event routes.
// Assumes Event model has an `organiserId` field referencing User.
// Do not mount duplicate endpoints; adapt fields to your project's Event schema.
const express = require('express');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Organisers see only events they own.
router.get('/mine', protect, authorizeRoles('ORGANISER'), async (req, res, next) => {
  try {
    const events = await Event.find({ organiserId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ events });
  } catch (err) { next(err); }
});

// An organiser can update only their own event. Use an allowlist of editable fields.
router.patch('/:eventId', protect, authorizeRoles('ORGANISER'), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.eventId)) {
      return res.status(400).json({ error: 'Invalid event ID.' });
    }

    const allowed = ['title', 'description', 'date', 'venue'];
    const updates = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update.' });
    }

    // Both event ID and owner ID are in the query; another organiser's event won't match.
    const event = await Event.findOneAndUpdate(
      { _id: req.params.eventId, organiserId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    return res.json({ event });
  } catch (err) { next(err); }
});

module.exports = router;
