import express from 'express';
import {
    getMyWishlists,
    createWishlist,
    getWishlistById,
    addItemToWishlist,
    removeItemFromWishlist,
    deleteWishlist,
    updateShareList,
    getSharedWithMe,
    generateShareLink,
    getSharedWishlist,
    addComment,
    rateWishlistItem,
    addNoteToWishlistItem,
    addChatMessage
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- CORE WISHLIST ROUTES ---

router.route('/').get(protect, getMyWishlists).post(protect, createWishlist);
router.route('/shared-with-me').get(protect, getSharedWithMe);
router.route('/shared/:token').get(getSharedWishlist);

// --- ROUTES FOR A SPECIFIC WISHLIST BY ID ---

router.route('/:id').get(protect, getWishlistById).delete(protect, deleteWishlist);
router.route('/:id/items').post(protect, addItemToWishlist);
router.route('/:id/items/:itemId').delete(protect, removeItemFromWishlist);

// --- FIX #1: This route was incorrect. It's now corrected to handle notes properly. ---
// @route   PUT /api/wishlist/:id/items/:itemId/note (Add a note to an item)
router.route('/:id/items/:itemId/note').put(protect, addNoteToWishlistItem);

// --- FIX #2: Added the missing 'vote' route. ---
// @route   POST /api/wishlist/:id/items/:itemId/vote (Vote for an item)
router.route('/:id/items/:itemId/rate').post(protect, rateWishlistItem);



// --- SHARING ROUTES FOR A SPECIFIC WISHLIST ---

router.route('/:id/share').put(protect, updateShareList);
router.route('/:id/generate-share-link').post(protect, generateShareLink);


// --- PUBLIC INTERACTIVE ROUTES (by public token) ---

router.route('/shared/:token/comment').post(protect, addComment);
// This route was duplicated, it is only needed for item-specific voting, so I am removing it from here.
// router.route('/shared/:token/vote').post(protect, voteOnWishlistItem);

router.route('/:id/chat').post(protect, addChatMessage);



export default router;