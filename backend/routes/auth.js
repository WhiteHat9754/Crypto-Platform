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
    isAdmin: !!req.session.isAdmin, // ✅ true for admins, false for normal
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

  // ✅ Use the SAME session flow as normal login
  req.session.userId = user._id;
  req.session.isAdmin = true;

  res.json({ message: 'Admin login successful', user: {
    id: user._id,
    email: user.email,
    isAdmin: true,
  } });
});



module.exports = router;
