// server/routes/commentRoutes.js
// Comment routes for shared wishlists

import express from 'express';
import {
    addCommentToSharedWishlist,
    getCommentsForSharedWishlist,
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/:shareToken')
    .post(protect, addCommentToSharedWishlist) // Add comment (requires login)
    .get(getCommentsForSharedWishlist); // Get comments (public)

export default router;
