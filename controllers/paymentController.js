const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// POST /api/payment/orders
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Valid amount required' });

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = { amount, currency: 'INR', receipt: crypto.randomBytes(10).toString('hex') };
    const order = await instance.orders.create(options);
    return res.json({ success: true, data: order });
  } catch (err) {
    console.error('createRazorpayOrder error:', err);
    return res.status(500).json({ success: false, message: 'Razorpay order creation failed' });
  }
};

// POST /api/payment/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(sign).digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const order = await Order.findById(order_id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.paymentInfo = {
      ...order.paymentInfo,
      status: 'Completed',
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    };
    order.paidAt = new Date();
    if (order.orderStatus === 'Pending Payment') {
      order.orderStatus = 'Processing';
    }
    await order.save();

    return res.json({ success: true });
  } catch (err) {
    console.error('verifyPayment error:', err);
    return res.status(500).json({ success: false, message: 'Verification failed' });
  }
};
