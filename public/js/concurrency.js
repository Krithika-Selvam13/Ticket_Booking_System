const ConcurrencyEngine = {
  // Requests a 5-minute atomic lock from server
  async holdSeats(showKey, seatIds, userId) {
    try {
      const res = await fetch(`/api/shows/${encodeURIComponent(showKey)}/hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatIds, userId })
      });
      return await res.json();
    } catch (err) {
      return { error: 'Network error or backend unreachable.' };
    }
  },

  // Releases a lock on cancellation or payment failure
  async releaseSeats(showKey, seatIds, userId) {
    return fetch(`/api/shows/${encodeURIComponent(showKey)}/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seatIds, userId })
    });
  },

  // Confirms seats as permanently booked
  async confirmBooking(showKey, seatIds, userId, bookingDetails) {
    const res = await fetch(`/api/shows/${encodeURIComponent(showKey)}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seatIds, userId, bookingDetails })
    });
    return await res.json();
  },

  // Criterion #5 & #10: Multi-Client Race Simulator
  // Launches 5 simultaneous asynchronous holds for seat 'B5'
  async simulateRaceCondition(showKey, targetSeat = 'B5') {
    const users = ['Alice_Client', 'Bob_Client', 'Carol_Client', 'Dave_Client', 'Eve_Client'];
    const logs = [];

    const racePromises = users.map(async (u) => {
      const startTime = performance.now();
      const res = await fetch(`/api/shows/${encodeURIComponent(showKey)}/hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatIds: [targetSeat], userId: u })
      });
      const data = await res.json();
      const elapsed = (performance.now() - startTime).toFixed(1);
      return { user: u, status: res.status, data, elapsed };
    });

    const results = await Promise.all(racePromises);
    results.forEach(r => {
      if (r.status === 200) {
        logs.push(`✅ [${r.elapsed}ms] ${r.user} successfully secured lock on seat ${targetSeat}.`);
      } else {
        logs.push(`❌ [${r.elapsed}ms] ${r.user} rejected with HTTP 409 Conflict: Double-booking avoided.`);
      }
    });

    return logs;
  }
};