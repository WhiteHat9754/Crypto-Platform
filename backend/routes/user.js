const express = require('express');
const router = express.Router();
const { getProfile, updatePhone } = require('../controllers/userController');

router.get('/profile', getProfile);

// ✅ Update phone number
router.post('/update-phone', updatePhone);

module.exports = router;
