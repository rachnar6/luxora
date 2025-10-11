import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Helper function to ensure consistent data is sent to the frontend
const getPopulatedCart = async (userId) => {
    return await Cart.findOne({ user: userId }).populate({
        path: 'items.product',
        select: 'name image price countInStock', // Ensure all necessary fields are populated
    });
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getUserCart = asyncHandler(async (req, res) => {
    let cart = await getPopulatedCart(req.user._id);

    if (cart) {
        res.json(cart);
    } else {
        res.json({ user: req.user._id, items: [] });
    }
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addItemToCart = asyncHandler(async (req, res) => {
    const { productId, qty } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        // Cart exists, check if item is already in cart
        const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);

        if (itemIndex > -1) {
            // Item exists, update quantity
            cart.items[itemIndex].qty += qty;
        } else {
            // ✅ THE FIX IS HERE: Add 'name' and 'image' from the product
            cart.items.push({
                product: productId,
                name: product.name,
                image: product.image,
                price: product.price,
                qty,
            });
        }
        await cart.save();
    } else {
        // No cart for user, create a new one
        // ✅ AND THE FIX IS HERE TOO
        await Cart.create({
            user: req.user._id,
            items: [{
                product: productId,
                name: product.name,
                image: product.image,
                price: product.price,
                qty,
            }],
        });
    }

    // Always return the fully populated cart to the frontend
    const populatedCart = await getPopulatedCart(req.user._id);
    res.status(200).json(populatedCart);
});

// @desc    Update item quantity in cart
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItemQuantity = asyncHandler(async (req, res) => {
    const { qty } = req.body;
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);

        if (itemIndex > -1) {
            cart.items[itemIndex].qty = qty;
            await cart.save();
            const populatedCart = await getPopulatedCart(req.user._id);
            res.json(populatedCart);
        } else {
            res.status(404);
            throw new Error('Product not found in cart');
        }
    } else {
        res.status(404);
        throw new Error('Cart not found for this user');
    }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeItemFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        await cart.save();
        const populatedCart = await getPopulatedCart(req.user._id);
        res.json(populatedCart);
    } else {
        res.status(404);
        throw new Error('Cart not found for this user');
    }
});

export { getUserCart, addItemToCart, updateCartItemQuantity, removeItemFromCart };

