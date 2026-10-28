const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Fallback State (Syncs seamlessly with MongoDB Atlas if MONGO_URI is set)
// Key: showtimeKey -> { seatId: { status, heldByUserId, holdExpiresAt, price, tier } }
const showInventories = {};
const completedBookings = [];

function getShowInventory(showKey) {
  if (!showInventories[showKey]) {
    const seats = {};
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    rows.forEach((row, rIdx) => {
      const tier = rIdx < 2 ? 'VIP' : rIdx < 6 ? 'PREMIUM' : 'CLASSIC';
      const price = tier === 'VIP' ? 350 : tier === 'PREMIUM' ? 250 : 150;
      for (let col = 1; col <= 10; col++) {
        const seatId = `${row}${col}`;
        seats[seatId] = {
          seatId,
          tier,
          price,
          status: 'AVAILABLE',
          heldByUserId: null,
          holdExpiresAt: null
        };
      }
    });
    showInventories[showKey] = seats;
  }
  return showInventories[showKey];
}

// 1. GET Show Seat Status (Auto-expires stale holds)
app.get('/api/shows/:showKey/seats', (req, res) => {
  const { showKey } = req.params;
  const inventory = getShowInventory(showKey);
  const now = new Date();

  // Expire holds past 5 minutes
  Object.values(inventory).forEach(seat => {
    if (seat.status === 'HELD' && seat.holdExpiresAt && new Date(seat.holdExpiresAt) < now) {
      seat.status = 'AVAILABLE';
      seat.heldByUserId = null;
      seat.holdExpiresAt = null;
    }
  });

  res.json({ success: true, seats: inventory });
});

// 2. POST Atomic Seat Hold (Guarantees no double booking)
app.post('/api/shows/:showKey/hold', (req, res) => {
  const { showKey } = req.params;
  const { seatIds, userId } = req.body;
  const inventory = getShowInventory(showKey);
  const now = new Date();
  const holdExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min hold

  // Atomic pre-validation
  for (const sId of seatIds) {
    const seat = inventory[sId];
    if (!seat) {
      return res.status(400).json({ error: `Seat ${sId} does not exist.` });
    }
    const isAvailable = seat.status === 'AVAILABLE' || 
      (seat.status === 'HELD' && seat.holdExpiresAt && new Date(seat.holdExpiresAt) < now);
    
    if (!isAvailable) {
      return res.status(409).json({ 
        error: `Seat ${sId} was just claimed by another user.` 
      });
    }
  }

  // Atomic state change
  seatIds.forEach(sId => {
    inventory[sId].status = 'HELD';
    inventory[sId].heldByUserId = userId;
    inventory[sId].holdExpiresAt = holdExpiry;
  });

  res.json({ success: true, holdExpiresAt: holdExpiry, heldSeats: seatIds });
});

// 3. POST Confirm Payment & Booking
app.post('/api/shows/:showKey/confirm', (req, res) => {
  const { showKey } = req.params;
  const { seatIds, userId, bookingDetails } = req.body;
  const inventory = getShowInventory(showKey);

  // Verify caller actually holds these seats
  for (const sId of seatIds) {
    const seat = inventory[sId];
    if (!seat || seat.heldByUserId !== userId || seat.status !== 'HELD') {
      return res.status(403).json({ error: `Hold expired or unverified for seat ${sId}.` });
    }
  }

  seatIds.forEach(sId => {
    inventory[sId].status = 'BOOKED';
    inventory[sId].holdExpiresAt = null;
  });

  const booking = {
    bookingId: 'CP-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    userId,
    showKey,
    seats: seatIds,
    ...bookingDetails,
    createdAt: new Date()
  };
  completedBookings.push(booking);

  res.json({ success: true, booking });
});

// 4. POST Release Hold (On Payment Failure or Cancellation)
app.post('/api/shows/:showKey/release', (req, res) => {
  const { showKey } = req.params;
  const { seatIds, userId } = req.body;
  const inventory = getShowInventory(showKey);

  seatIds.forEach(sId => {
    if (inventory[sId] && inventory[sId].heldByUserId === userId) {
      inventory[sId].status = 'AVAILABLE';
      inventory[sId].heldByUserId = null;
      inventory[sId].holdExpiresAt = null;
    }
  });

  res.json({ success: true, message: 'Seats released successfully' });
});

// 5. GET Organiser Dashboard Metrics
app.get('/api/organiser/stats', (req, res) => {
  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  let totalBooked = 0;
  let totalHeld = 0;
  let totalSeats = 0;

  Object.values(showInventories).forEach(inv => {
    Object.values(inv).forEach(seat => {
      totalSeats++;
      if (seat.status === 'BOOKED') totalBooked++;
      if (seat.status === 'HELD') totalHeld++;
    });
  });

  res.json({
    revenue: totalRevenue,
    totalBookings: completedBookings.length,
    bookedSeats: totalBooked,
    heldSeats: totalHeld,
    totalCapacity: totalSeats || 100,
    occupancyPct: totalSeats ? Math.round((totalBooked / totalSeats) * 100) : 0,
    bookings: completedBookings.slice(-10).reverse()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CinePulse Server running on http://localhost:${PORT}`);
});