const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);


// /api/auth/session
router.get('/session', async (req, res) => {
  if (!req.session.userId) {
    return res.json({ user: null });
  }

  const user = await User.findById(req.session.userId).select('-password');
  if (!user) {
    return res.json({ user: null });
  }

  res.json({ user: {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    countryCode: user.countryCode,
    referralCode: user.referralCode || null,
    kycStatus: user.kycStatus || 'not_verified',
    isAdmin: !!req.session.isAdmin,
  } });
});


// /api/auth/admin-login
router.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: 'Admin access only' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  req.session.userId = user._id;
  req.session.isAdmin = true;

  // ✅ This ensures your session is written to Mongo before you respond:
  req.session.save(err => {
    if (err) {
      console.error('Session save error:', err);
      return res.status(500).json({ message: 'Session save failed.' });
    }

    console.log('Session saved:', req.session);
    return res.json({
      message: 'Admin login successful',
      user: { id: user._id, email: user.email, isAdmin: true },
    });
  });
});



module.exports = router;
