// server/routes/userRoutes.js

import express from 'express';
const router = express.Router();
import {
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
    applyToBeSeller,
    getUserAddresses,
    addShippingAddress,
    searchUsers,
    getSellerProfile,
    updateSellerProfile
} from '../controllers/userController.js';
import { protect, admin, seller } from '../middleware/authMiddleware.js'; // Keep admin if needed for future routes
import upload from '../utils/fileUpload.js';

// --- Routes for the Logged-in User ---

// User Profile routes (GET, PUT, DELETE own profile)
router
    .route('/profile')
    .get(protect, getUserProfile)
    .put(protect, upload.single('profilePicture'), updateUserProfile)
    .delete(protect, deleteUserProfile);

// Seller Application route
router.route('/apply-seller').post(protect, applyToBeSeller);

// Address routes (GET addresses, POST new address)
router.route('/addresses')
    .get(protect, getUserAddresses)
    .post(protect, addShippingAddress);

// Search users route (GET based on keyword query)
router.route('/search').get(protect, searchUsers);



// @desc    Get or Update seller profile
// @route   GET /api/users/seller/profile
// @route   PUT /api/users/seller/profile
// @access  Private/Seller
router.route('/seller/profile')
  .get(protect, seller, getSellerProfile) // We'll add this to get current data
  .put(protect, seller, updateSellerProfile);

export default router;