// server/models/Comment.js
// Comment Model for shared wishlists

import mongoose from 'mongoose';

const commentSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        userName: { // Store user name for display convenience
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        wishlistShare: { // Reference to the specific shared wishlist instance
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'WishlistShare',
        },
    },
    {
        timestamps: true,
    }
);

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
