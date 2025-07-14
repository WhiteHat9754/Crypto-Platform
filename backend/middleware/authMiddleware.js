// Example: verify JWT & check if user is admin
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.verifyAdmin = (req, res, next) => {
  if (!req.session.isAdmin) {
    console.log('Admin access denied');
    return res.status(401).json({ message: 'Unauthorized' });
  }
  console.log('Admin verified');
  next();
};

