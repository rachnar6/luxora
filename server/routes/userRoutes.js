import express from 'express';
import {
  deleteUserProfile,
  applyToBeSeller,
  searchUsers,
  getUserAddresses,
  addShippingAddress,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.route('/profile').delete(protect, deleteUserProfile);

router.route('/apply-seller').post(protect, applyToBeSeller);

router.route('/search').get(protect, searchUsers);

router.route('/addresses')
    .get(protect, getUserAddresses)
    .post(protect, addShippingAddress);


export default router;