// server/routes/cartRoutes.js
// Cart routes

import express from 'express';
import {
    getUserCart,
    addItemToCart,
    updateCartItemQuantity,
    removeItemFromCart,
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getUserCart).post(protect, addItemToCart);
router
    .route('/:productId')
    .put(protect, updateCartItemQuantity)
    .delete(protect, removeItemFromCart);

export default router;
