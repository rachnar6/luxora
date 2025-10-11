import express from 'express';
import {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getOrders,
    getMySales,
    createRazorpayOrder // ✅ 1. Import the new function
} from '../controllers/orderController.js';
import { protect, admin, seller } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Define specific, static routes FIRST ---

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/mysales').get(protect, seller, getMySales);

// ✅ 2. Add the new route for creating a Razorpay order
router.route('/create-razorpay-order').post(protect, createRazorpayOrder);

// Configuration routes
router.get('/config/paypal', (req, res) =>
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID })
);
// It's good practice to also have a route to get your Razorpay Key ID
router.get('/config/razorpay', (req, res) => {
    res.send({ keyId: process.env.RAZORPAY_KEY_ID });
});


// --- Define general/dynamic routes LAST ---

router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);


export default router;