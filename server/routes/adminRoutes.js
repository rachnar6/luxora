import express from 'express';
import {
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  getProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  getOrders,
  updateOrderToDelivered,
  getSellerApplications,
  approveSellerApplication,
  rejectSellerApplication,
  getSellers,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// User management routes
router.route('/users').get(protect, admin, getUsers);
router.route('/users/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser);

// Product management routes
router.route('/products').get(protect, admin, getProducts).post(protect, admin, createProduct);
router.route('/products/:id')
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct);

// Order management routes
router.route('/orders').get(protect, admin, getOrders);
router.route('/orders/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/seller-applications').get(protect, admin, getSellerApplications);
router.route('/seller-applications/:id/approve').put(protect, admin, approveSellerApplication);
router.route('/seller-applications/:id/reject').put(protect, admin, rejectSellerApplication);
router.route('/sellers').get(protect, admin, getSellers);

export default router;