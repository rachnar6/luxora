// server/models/Cart.js
// Cart Model (simplified for a single user cart)

import mongoose from 'mongoose';

const cartItemSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    qty: {
        type: Number,
        required: true,
        default: 1,
    },
});

const cartSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            unique: true, // Each user has one cart
        },
        items: [cartItemSchema],
    },
    {
        timestamps: true,
    }
);

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
