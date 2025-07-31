const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment } = require('../controllers/paymentController');
const auth = require('../middleware/authMiddleware');

router.post('/orders', auth, createRazorpayOrder);
router.post('/verify', auth, verifyPayment);

module.exports = router;