// Example: verify JWT & check if user is admin
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.verifyAdmin = (req, res, next) => {
  if (!req.session.userId || !req.session.isAdmin) {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

