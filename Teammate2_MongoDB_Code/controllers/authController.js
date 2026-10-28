const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function makeToken(user) {
  return jwt.sign({}, process.env.JWT_SECRET, {
    subject: user._id.toString(),
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    algorithm: 'HS256',
    issuer: 'ticket-booking-api',
    audience: 'ticket-booking-client',
  });
}

function publicUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 12);

    // Never accept role from public registration input.
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: 'USER',
    });

    return res.status(201).json({ user: publicUser(user), token: makeToken(user) });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const email = req.body.email.trim().toLowerCase();
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    return res.json({ user: publicUser(user), token: makeToken(user) });
  } catch (err) {
    return next(err);
  }
}

function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = { register, login, me };
