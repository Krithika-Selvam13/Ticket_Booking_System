# Product Requirements Document (PRD) — CinePulse

## 1. Project Overview & Scope

CinePulse is a concurrent cinema ticket booking platform built with Node.js, Express, MongoDB, and Tailwind CSS. It replicates the core operational flow of BookMyShow, ensuring that the same seat can never be double-booked even when multiple users attempt simultaneous checkouts.

### In Scope

- **User Experience**: Multi-day movie catalogue (11 titles), cinema discovery across Bangalore theatres, interactive tiered auditorium seat grid, 5-minute atomic seat holding, mock payment simulation (Success/Failure), digital booking pass generation, and self-service cancellation.
- **Admin / Organiser Experience**: Live analytics dashboard displaying aggregate revenue, occupancy meters, active lock counts, confirmed ticket audit logs, and an integrated multi-threaded concurrency race condition stress tester.
- **Security & Integrity**: 20 requests/minute rate limiting on hold/booking routes, database-level atomic locking, and strict role-based route separation.

### Explicitly Out of Scope

- Production third-party payment gateways (Stripe/Razorpay real merchant accounts).
- SMS/Email OTP delivery services.

---

## 2. Technical Stack

- **Runtime & Server**: Node.js, Express.js (REST APIs)
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Tailwind CSS, FontAwesome
- **Visual Engines**: React Bits Micro-Slats Canvas & React Bits 3D Cylindrical Orbit Carousel

---

## 3. Addressing Evaluation Criteria (1 to 10)

### Criterion 1: Who are your users, what can they do, and what is out of scope?

- **User Role**: Browse movies, select date/showtime, hold seats for 5 minutes, simulate payment, view "My Bookings", and cancel tickets.
- **Organiser Role**: Real-time revenue analytics, seat occupancy monitoring, active holds tracking, and concurrency stress testing.
- **Out of Scope**: Third-party SMS/payment webhooks and physical ticket barcode scanning.

### Criterion 2 & 5: Concurrency Guarantee — How do two users never get the same seat?

- **Concurrency Engine**: MongoDB atomic updates via `Seat.findOneAndUpdate()`.
- **Atomic Precondition**: A seat is claimed if and only if:
  `{ status: 'AVAILABLE' } OR { status: 'HELD', holdExpiresAt: { $lt: new Date() } }`
- **Race Condition Resolution**: If two requests hit MongoDB in the same millisecond, MongoDB serializes the document update. Exactly one request updates the record and receives the document; all other requests receive `null` and are rejected with **HTTP 409 Conflict**. Any partial batch allocations roll back immediately.

### Criterion 3: Architecture & Module Rationale

- Modular separation across `server.js` (API endpoints and atomic transactions), `concurrency.js` (client-side lock dispatch and test runner), `carousel.js` (3D orbital movie selector), `background.js` (GPU micro-slats canvas), and `app.js` (UI state, multi-day scheduling, and dashboard rendering).

### Criterion 4: Data Model & Why MongoDB?

- Relational schema modeling inside MongoDB using Mongoose documents (`User`, `Seat`, `Booking`).
- Compound index `{ showKey: 1, seatId: 1 }` guarantees rapid query lookups and enforces unique constraints per auditorium showtime.

### Criterion 6 & 7: End-to-End Booking Flow, Retries & Failed Holds

- State transitions: `AVAILABLE` -> `HELD` (5-minute TTL) -> `BOOKED` (on payment success).
- On payment failure, the client triggers `/api/shows/:showKey/release`, reverting seats immediately to `AVAILABLE`.
- If an abandoned hold expires, the backend query automatically treats it as `AVAILABLE`.

### Criterion 8: Security, Rate Limiting & Isolation

- **Rate Limiting**: `express-rate-limit` enforces a ceiling of **20 requests per minute** on `/api/shows/:showKey/hold` and `/api/shows/:showKey/confirm`.
- **Data Isolation**: User bookings are isolated by authenticated `userId` queries (`/api/users/:userId/bookings`). Users cannot view or cancel other patrons' tickets.

### Criterion 9: Organiser Dashboard Accuracy

- Aggregate aggregation queries in `/api/organiser/stats` calculate real-time revenue as the exact sum of all confirmed ticket prices. Occupancy rate updates dynamically:
  $$\text{Occupancy Rate} = \frac{\text{Total Booked Seats}}{\text{Total Auditorium Capacity}} \times 100\%$$

### Criterion 10: Deployment & Verification

- Packaged with standard `npm install` and `npm start` commands.
- Includes a built-in **Concurrency Race Simulator** directly on the Organiser Dashboard firing 5 asynchronous parallel promises against the same seat to prove live rejection.
