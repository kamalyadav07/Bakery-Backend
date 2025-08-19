const Order = require('../models/Order');
const Product = require('../models/Product');

function computeItemsPrice(items) {
  return items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
}

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { orderItems, shippingInfo = {}, paymentInfo, orderType, pickupTime, specialInstructions } = req.body;
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ msg: 'No order items' });
    }
    if (!paymentInfo || !paymentInfo.method) {
      return res.status(400).json({ msg: 'Payment method required' });
    }
    if (!orderType) {
      return res.status(400).json({ msg: 'orderType required' });
    }

    // Validate stock & freeze price/name
    for (const item of orderItems) {
      const p = await Product.findById(item.product);
      if (!p) return res.status(400).json({ msg: `Invalid product ${item.product}` });
      if (!p.isAvailable) return res.status(400).json({ msg: `${p.name} is not available` });
      if (p.stock < item.quantity) return res.status(400).json({ msg: `Insufficient stock for ${p.name}` });
      item.price = p.price;
      item.name = p.name;
    }

    const itemsPrice = computeItemsPrice(orderItems);
    const shippingPrice = orderType === 'Delivery' ? 40 : 0;
    const totalPrice = itemsPrice + shippingPrice;

    const orderStatus = paymentInfo.method === 'COD' ? 'Processing' : 'Pending Payment';

    const order = await Order.create({
      user: req.user.id,
      orderItems,
      orderType,
      shippingInfo,
      paymentInfo: {
        method: paymentInfo.method,
        status: paymentInfo.method === 'COD' ? 'Pending' : 'Pending',
      },
      itemsPrice,
      shippingPrice,
      totalPrice,
      pickupTime: orderType === 'Takeaway' ? pickupTime : null,
      specialInstructions,
      orderStatus,
    });

    // Reduce stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    res.status(201).json(order);
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).send('Server Error');
  }
};

// PUT /api/orders/:id/status  (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, declineReason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin access denied' });

    order.orderStatus = status;
    if (status === 'Declined') {
      order.declineReason = declineReason || 'Not specified';
    }
    if (status === 'Delivered') {
      order.deliveredAt = new Date();
    }
    await order.save();
    res.json(order);
  } catch (err) {
    console.error('updateOrderStatus error:', err);
    res.status(500).send('Server Error');
  }
};

// GET /api/orders/myorders  (user)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('getMyOrders error:', err);
    res.status(500).send('Server Error');
  }
};

// GET /api/orders  (admin)
exports.getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin access denied' });
    const orders = await Order.find().populate('user', 'username phone').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('getAllOrders error:', err);
    res.status(500).send('Server Error');
  }
};

// GET /api/orders/earnings  (admin)
exports.getEarnings = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin access denied' });

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const matchPaid = {
      $or: [
        { 'paymentInfo.method': 'COD', orderStatus: { $ne: 'Declined' } },
        { 'paymentInfo.status': 'Completed' }
      ]
    };

    async function sumSince(date) {
      const agg = await Order.aggregate([
        { $match: { ...matchPaid, createdAt: { $gte: date } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]);
      return agg[0]?.total || 0;
    }

    const [daily, monthly, yearly] = await Promise.all([
      sumSince(startOfDay),
      sumSince(startOfMonth),
      sumSince(startOfYear)
    ]);

    res.json({ daily, monthly, yearly });
  } catch (err) {
    console.error('getEarnings error:', err);
    res.status(500).send('Server Error');
  }
};
