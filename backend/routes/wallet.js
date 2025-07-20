const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

router.get('/balance', walletController.getBalance);
router.get('/transactions', walletController.getTransactions);
router.post('/deposit', walletController.createDeposit);
router.post('/nowpayments-webhook', walletController.nowPaymentsWebhook);
router.post('/withdraw', walletController.withdraw);
router.post('/transfer', walletController.transfer);
router.post('/swap', walletController.swap);

module.exports = router;
