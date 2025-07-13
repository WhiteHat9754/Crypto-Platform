const express = require('express');
const { createPayment, handleWebhook } = require('../controllers/paymentsController');
const router = express.Router();

router.post('/create', createPayment);
router.post('/webhook', handleWebhook);

module.exports = router;
