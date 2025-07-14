const User = require('../models/User');

exports.getProfile = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const user = await User.findById(req.session.userId).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePhone = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { phone, countryCode } = req.body;
  if (!phone || !countryCode) {
    return res.status(400).json({ message: 'Phone and country code required' });
  }

  await User.findByIdAndUpdate(req.session.userId, {
    phone,
    countryCode,
  });

  res.json({ message: 'Phone updated' });
};