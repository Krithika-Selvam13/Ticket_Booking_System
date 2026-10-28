# Teammate 2 checklist

- [ ] Register and login work; password hashes use bcrypt.
- [ ] Public registration always assigns `USER`, even if request includes a `role`.
- [ ] Organiser role is granted only by trusted admin/manual process.
- [ ] JWT middleware protects private endpoints.
- [ ] USER-only booking routes use `Booking.find({ userId: req.user.id })`.
- [ ] Booking cancellation query includes both booking ID and authenticated user ID.
- [ ] ORGANISER-only event routes use `Event.find({ organiserId: req.user.id })`.
- [ ] Event update query includes both event ID and authenticated organiser ID.
- [ ] Use `req.user.id`, never trust `req.body.userId` or `req.body.organiserId`.
- [ ] Use Mongoose query objects and validated values; no SQL is used in this MongoDB project.
- [ ] Use field allowlists for updates; do not pass `req.body` directly to `$set`.
- [ ] Input validation and login rate limiting are enabled.
- [ ] `.env` is ignored by Git and secrets are not committed.

## Promote an organiser for local testing
Only do this for a trusted test account using MongoDB shell/admin access, not a public API:
```javascript
db.users.updateOne(
  { email: "organiser@example.com" },
  { $set: { role: "ORGANISER" } }
)
```
