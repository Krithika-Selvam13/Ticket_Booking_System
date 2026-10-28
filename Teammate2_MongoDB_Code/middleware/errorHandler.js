function notFound(_req, res) {
  return res.status(404).json({ error: 'Route not found.' });
}

function errorHandler(err, _req, res, _next) {
  console.error(err); // server-side logs only
  if (err && err.name === 'ValidationError') return res.status(400).json({ error: 'Invalid data.' });
  if (err && err.name === 'MongoServerSelectionError') return res.status(503).json({ error: 'Database temporarily unavailable.' });
  return res.status(500).json({ error: 'Internal server error.' });
}

module.exports = { notFound, errorHandler };
