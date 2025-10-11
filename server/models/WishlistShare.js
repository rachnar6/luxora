// server/models/WishlistShare.js
// WishlistShare Model to manage sharing and comments

import mongoose from 'mongoose';

const wishlistShareSchema = mongoose.Schema(
    {
        wishlist: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Wishlist',
        },
        owner: { // The user who owns the original wishlist
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        shareToken: { // A unique, shareable token for public access
            type: String,
            required: true,
            unique: true,
        },
        sharedWith: [ // Users with whom this wishlist has been explicitly shared (optional, for future features)
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        // Comments are stored in a separate collection and linked via wishlistShare field
    },
    {
        timestamps: true,
    }
);

const WishlistShare = mongoose.model('WishlistShare', wishlistShareSchema);

export default WishlistShare;
