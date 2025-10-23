// backend/routes/orderRoutes.js
import express from 'express';
import {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getOrders,
    getMySales,
    createRazorpayOrder,
    updateOrderStatus,
    requestOrderItemReturn
} from '../controllers/orderController.js';
// 👇👇👇 Corrected import name 👇👇👇
import { protect, admin, isSeller } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Define specific, static routes FIRST ---

// POST /api/orders/      (Create Order - Logged in User)
// GET  /api/orders/      (Get All Orders - Admin Only)
router.route('/')
    .post(protect, addOrderItems)
    .get(protect, admin, getOrders); // Admin gets all orders (can add search query)

// GET /api/orders/myorders (Get Logged-in User's Orders - Buyer)
router.route('/myorders').get(protect, getMyOrders);

// GET /api/orders/mysales  (Get Logged-in Seller's Orders)
router.route('/mysales').get(protect, isSeller, getMySales); // Use isSeller middleware

// POST /api/orders/create-razorpay-order (Create Razorpay order ID)
router.route('/create-razorpay-order').post(protect, createRazorpayOrder);

// Configuration routes
router.get('/config/paypal', (req, res) =>
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID })
);
router.get('/config/razorpay', protect, (req, res) => { // Protect Razorpay key route
    res.send({ keyId: process.env.RAZORPAY_KEY_ID });
});


router.route('/:id').get(protect, getOrderById);

router.route('/:id/pay').put(protect, updateOrderToPaid);

router.route('/:id/status').put(protect, isSeller, updateOrderStatus);
router.route('/:id/items/:itemId/return').put(protect, requestOrderItemReturn);

export default router;