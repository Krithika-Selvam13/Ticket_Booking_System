const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  try {
    const match = (req.get('authorization') || '').match(/^Bearer\s+([^\s]+)$/i);
    if (!match) return res.status(401).json({ error: 'Authentication required.' });
    if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'Authentication is not configured.' });

    const payload = jwt.verify(match[1], process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'ticket-booking-api',
      audience: 'ticket-booking-client',
    });
    if (!payload.sub) return res.status(401).json({ error: 'Invalid authentication token.' });

    const user = await User.findById(payload.sub).select('_id name email role');
    if (!user) return res.status(401).json({ error: 'User account is no longer available.' });

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
    return next();
  } catch (err) {
    if (['TokenExpiredError', 'JsonWebTokenError', 'NotBeforeError', 'CastError'].includes(err.name)) {
      return res.status(401).json({ error: 'Invalid or expired authentication token.' });
    }
    return next(err);
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required.' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to access this resource.' });
    }
    return next();
  };
}

module.exports = { protect, authorizeRoles };
