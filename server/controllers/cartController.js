import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart.js';

const getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id })
        // --- THIS POPULATE FETCHES LATEST STOCK ---
        .populate({
            path: 'items.product', // Path to product in your cart items schema
            select: 'name image price countInStock' // Crucially include countInStock
        });
        // ------------------------------------------

    if (cart) {
        // Filter out items where the referenced product might have been deleted
        cart.items = cart.items.filter(item => item.product != null); 
        
        // Optional: Check if requested qty exceeds current stock and adjust/notify?
        // (This is more advanced logic you could add later)
        // cart.items.forEach(item => {
        //    if (item.qty > item.product.countInStock) {
        //       // Maybe mark item, reduce qty, etc.
        //    }
        // });
        // await cart.save(); // If you modify quantities

        res.json(cart);
    } else {
        // If no cart in DB, send back a valid empty cart structure
        res.json({ user: req.user._id, items: [] });
    }
});

const addToCart = asyncHandler(async (req, res) => {
    const { productId, qty } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });

    // If no cart exists, create a new one
    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existItem = cart.items.find((x) => x.product.toString() === productId);

    if (existItem) {
        existItem.qty = qty;
    } else {
        // This is now valid because we only need the product ID and qty
        cart.items.push({ product: productId, qty });
    }

    await cart.save();
    // Populate the response to send full details back to the frontend
    const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name image price');
    res.status(201).json(populatedCart);
});

const updateCartItem = asyncHandler(async (req, res) => {
    const { qty } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        const item = cart.items.find(x => x.product.toString() === req.params.productId);
        if (item) {
            item.qty = qty;
            await cart.save();
            const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name image price');
            res.json(populatedCart);
        } else {
            res.status(404);
            throw new Error('Item not found in cart');
        }
    } else {
        res.status(404);
        throw new Error('Cart not found');
    }
});

const removeFromCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        cart.items = cart.items.filter(x => x.product.toString() !== req.params.productId);
        await cart.save();
        const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name image price');
        res.json(populatedCart);
    } else {
        res.status(404);
        throw new Error('Cart not found');
    }
});

const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
        cart.items = [];
        await cart.save();
        res.status(200).json({ message: 'Cart cleared successfully' });
    } else {
        res.status(200).json({ message: 'Cart is already empty' });
    }
});

export {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};