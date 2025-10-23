import express from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes for the entire cart
router.route('/')
    .get(protect, getCart)
    .post(protect, addToCart)
    .delete(protect, clearCart);

// Routes for a specific item in the cart
router.route('/:productId')
    .put(protect, updateCartItem)
    .delete(protect, removeFromCart);

export default router;