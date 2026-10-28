# Teammate 2 — Login, Roles, Ownership & API Protection (MongoDB)

This code pack implements the teammate 2 requirements using **Node.js + Express + MongoDB + Mongoose**.

## SQL vs MongoDB
Your requirement mentions parameterized SQL queries. This project uses MongoDB, so it does not use SQL queries. Instead, use Mongoose query objects with validated values, schema validation, and explicit ownership filters. Do not build MongoDB queries by concatenating user-provided strings or accept arbitrary query objects from request bodies.

## Includes
- Registration and login with bcrypt password hashing
- JWT authentication middleware
- `USER` and `ORGANISER` roles
- Example ownership-protected booking and event routes
- Request validation, rate limiting, Helmet, CORS, JSON body limit, MongoDB operator sanitization
- MongoDB connection and environment configuration

## Install
From your project folder:

```bash
npm install bcryptjs jsonwebtoken express-validator express-rate-limit helmet express-mongo-sanitize
```

Mongoose, Express, cors, and dotenv should already be dependencies in your project.

## Environment
Copy `.env.example` to `.env`, then set:
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — random secret with at least 32 bytes
- `CLIENT_ORIGIN` — exact frontend origin
- `JWT_EXPIRES_IN` — e.g. `1h`

Generate a secret using PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Never commit `.env`.

## Add to server.js
1. Load dotenv before reading environment variables.
2. Add security middleware as shown in `INTEGRATION_SNIPPET.js.txt`.
3. Mount `app.use('/api/auth', require('./routes/authRoutes'))`.
4. Merge the example booking/event routes with your existing route handlers. Do not mount duplicate routes.
5. Connect to MongoDB before calling `app.listen`.
6. Add `protect` to private endpoints and `authorizeRoles('ORGANISER')` to organiser-only endpoints.

## Role policy
- Public registration always creates a `USER`. It deliberately ignores any `role` field submitted by the client.
- Promote a trusted organiser account manually through a secure admin process. Never add a public “change my role” endpoint.
- JWT identity comes from the verified token and database user record, not `req.body.userId`.

## Ownership policy
- Users may read/cancel only bookings whose `userId` equals `req.user.id`.
- Organisers may manage only events whose `organiserId` equals `req.user.id`.
- Ownership checks belong in the database query itself, for example `Booking.findOne({ _id: bookingId, userId: req.user.id })`.
- Replace model paths/field names in the example routes if your project's models use different names.

## Important
The booking and event route files are examples and assume:
- `models/Booking.js` exports a Mongoose model with a `userId` field.
- `models/Event.js` exports a Mongoose model with an `organiserId` field.
If those models don't exist yet, coordinate with the teammate responsible for booking/event data models. This pack does not create the booking/event schemas.

## Quick tests
- Register with a `role: "ORGANISER"` field: returned role must still be `USER`.
- Duplicate email: HTTP 409.
- Wrong password: HTTP 401.
- No/invalid token on private route: HTTP 401.
- USER on organiser route: HTTP 403.
- User A requesting User B's booking: HTTP 404.
- Organiser A editing Organiser B's event: HTTP 404.
- Invalid body / Mongo operator object as email: HTTP 400.
- Repeated login attempts: HTTP 429 after the configured limit.
