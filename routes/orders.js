const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    getEarnings // Import new function
} = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');

router.route('/').post(auth, createOrder).get(auth, getAllOrders);
router.route('/myorders').get(auth, getMyOrders);
router.route('/earnings').get(auth, getEarnings); // <-- ADD THIS LINE
router.route('/:id/status').put(auth, updateOrderStatus);

module.exports = router;
