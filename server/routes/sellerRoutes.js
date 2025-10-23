// backend/routes/sellerRoutes.js (or userRoutes.js)

import express from 'express';
const router = express.Router();
import {
    // Import your existing controller functions
    getSellerProfile,
    updateSellerProfile,
    getSellerReport,
    addSellerExpense,
    getPublicSellerReport
} from '../controllers/SellerController.js'; // Or userController.js
import { protect, isSeller } from '../middleware/authMiddleware.js'; // Import your middleware

// --- Existing Seller Routes ---
router.route('/profile')
    .get(protect, isSeller, getSellerProfile)
    .put(protect, isSeller, updateSellerProfile);

router.get('/:id/report', getPublicSellerReport);

// router.get('/:id', getPublicSellerProfile); 

router.get('/reports', protect, isSeller, getSellerReport);

router.post('/expenses', protect, isSeller, addSellerExpense);


// --- Potentially add routes for managing expenses ---
// Example:
// router.route('/expenses')
//     .post(protect, isSeller, addSellerExpense) // Need addSellerExpense controller
//     .get(protect, isSeller, getAllSellerExpenses); // Need getAllSellerExpenses controller
// router.get('/expenses/period', protect, isSeller, getSellerExpensesByPeriod); // Need controller

export default router;