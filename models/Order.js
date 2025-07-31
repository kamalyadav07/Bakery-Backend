const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        },
    ],
    orderType: { type: String, required: true, enum: ['Delivery', 'Takeaway'], default: 'Delivery' },
    shippingInfo: {
        address: { type: String, required: function() { return this.orderType === 'Delivery'; } },
        city: { type: String, required: function() { return this.orderType === 'Delivery'; } },
        postalCode: { type: String, required: function() { return this.orderType === 'Delivery'; } },
    },
    pickupTime: { type: Date, required: function() { return this.orderType === 'Takeaway'; } },
    paymentInfo: {
        method: { type: String, required: true, enum: ['Card', 'UPI', 'COD'] },
        status: { type: String, required: true, default: 'Pending' },
        razorpay_payment_id: { type: String },
        razorpay_order_id: { type: String },
        razorpay_signature: { type: String },
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    specialInstructions: { type: String },
    orderStatus: {
        type: String,
        required: true,
        enum: ['Processing', 'Accepted', 'Declined', 'Delivered', 'Pending Payment'],
        default: 'Processing',
    },
    declineReason: { type: String },
    paidAt: { type: Date },
    deliveredAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
