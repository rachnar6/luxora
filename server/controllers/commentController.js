// server/controllers/commentController.js
// Comment controllers for shared wishlists

import asyncHandler from '../utils/asyncHandler.js';
import Comment from '../models/Comment.js';
import WishlistShare from '../models/WishlistShare.js';
import User from '../models/User.js'; // To get user name for comments

// @desc    Add a comment to a shared wishlist
// @route   POST /api/comments/:shareToken
// @access  Private (only logged-in users can comment)
const addCommentToSharedWishlist = asyncHandler(async (req, res) => {
    const { shareToken } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    // Find the shared wishlist instance
    const wishlistShare = await WishlistShare.findOne({ shareToken });

    if (!wishlistShare) {
        res.status(404);
        throw new Error('Shared wishlist not found');
    }

    // Get the user's name for the comment
    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const comment = new Comment({
        user: userId,
        userName: user.name,
        text,
        wishlistShare: wishlistShare._id, // Link to the WishlistShare document
    });

    const createdComment = await comment.save();
    res.status(201).json(createdComment);
});

// @desc    Get comments for a shared wishlist
// @route   GET /api/comments/:shareToken
// @access  Public
const getCommentsForSharedWishlist = asyncHandler(async (req, res) => {
    const { shareToken } = req.params;

    const wishlistShare = await WishlistShare.findOne({ shareToken });

    if (!wishlistShare) {
        res.status(404);
        throw new Error('Shared wishlist not found');
    }

    const comments = await Comment.find({ wishlistShare: wishlistShare._id })
        .populate('user', 'name') // Populate user name if not already stored in comment
        .sort({ createdAt: 1 }); // Sort by creation date ascending

    res.json(comments);
});

export { addCommentToSharedWishlist, getCommentsForSharedWishlist };
