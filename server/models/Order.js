// server/models/Order.js
// Order Model

import mongoose from 'mongoose';

const orderItemSchema = mongoose.Schema({
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
    },
    returnStatus: {
        type: String,
        enum: ['None', 'Requested', 'Approved', 'Rejected', 'Received', 'Refunded'], // Define possible statuses
        default: 'None', // Default is no return active
    },
    returnReason: {
        type: String, // Reason provided by customer
    },
    returnRequestedAt: {
        type: Date, // When the return was requested
    },
});

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        orderItems: [orderItemSchema],
        shippingAddress: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        trackingHistory: [
            {
                status: { type: String, required: true },
                updatedAt: { type: Date, default: Date.now },
            }
        ],
        paymentMethod: {
            type: String,
            required: true,
        },
        paymentResult: {
            id: { type: String },
            status: { type: String },
            update_time: { type: String },
            email_address: { type: String },
        },
        taxPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        shippingPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        orderStatus: {
            type: String,
            required: true,
            default: 'Pending', // Add a default status
            enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'] // Optional: Define allowed statuses
},
        paidAt: {
            type: Date,
        },
        isDelivered: {
            type: Boolean,
            required: true,
            default: false,
        },
        deliveredAt: {
            type: Date,
        },
        
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
