const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
    const {
        orderItems, shippingInfo, paymentInfo, itemsPrice,
        shippingPrice, totalPrice, orderType, pickupTime, specialInstructions
    } = req.body;

    try {
        let orderStatus = 'Processing';
        // For online payments, set initial status to 'Pending Payment'
        if (paymentInfo.method !== 'COD') {
            orderStatus = 'Pending Payment';
        }

        const order = new Order({
            user: req.user.id,
            orderItems,
            shippingInfo: orderType === 'Delivery' ? shippingInfo : {},
            paymentInfo,
            itemsPrice,
            shippingPrice,
            totalPrice,
            orderType,
            pickupTime: orderType === 'Takeaway' ? pickupTime : null,
            specialInstructions,
            orderStatus,
        });

        const createdOrder = await order.save();

        // IMPORTANT: Update stock for the items in the order
        // This needs to run for both COD and online orders
        for (const item of createdOrder.orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity },
            });
        }

        res.status(201).json(createdOrder);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// ... (The rest of the functions in this file remain unchanged)
exports.updateOrderStatus = async (req, res) => { /* ... no change ... */ };
exports.getMyOrders = async (req, res) => { /* ... no change ... */ };
exports.getAllOrders = async (req, res) => { /* ... no change ... */ };
exports.getEarnings = async (req, res) => { /* ... no change ... */ };
