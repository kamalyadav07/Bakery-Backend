const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// --- Create Razorpay Order ---
exports.createRazorpayOrder = async (req, res) => {
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: req.body.amount, // amount in the smallest currency unit (e.g., paise)
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex"),
        };

        instance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: "Something Went Wrong!" });
            }
            res.status(200).json({ data: order });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};

// --- Verify Payment ---
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Payment is verified, now update our database order
            const order = await Order.findById(order_id);
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }

            order.paymentInfo.status = "Completed";
            order.paymentInfo.razorpay_payment_id = razorpay_payment_id;
            order.paymentInfo.razorpay_order_id = razorpay_order_id;
            order.paymentInfo.razorpay_signature = razorpay_signature;
            order.paidAt = Date.now();
            order.orderStatus = "Processing"; // Move from Pending Payment to Processing

            await order.save();

            return res.status(200).json({ message: "Payment verified successfully" });
        } else {
            return res.status(400).json({ message: "Invalid signature sent!" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
};