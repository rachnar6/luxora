import mongoose from 'mongoose';

const cartItemSchema = mongoose.Schema({
    // We only need to store the ID of the product
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
    },
    qty: {
        type: Number,
        required: true,
    },
    // The name, price, and image fields are removed from the schema
});

const cartSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        items: [cartItemSchema], // Use the simplified schema
    },
    {
        timestamps: true,
    }
);

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;