import asyncHandler from 'express-async-handler';
import Wishlist from '../models/wishlistModel.js';
import Product from '../models/Product.js'; // ✅ Import Product model
import User from '../models/User.js'; // ✅ Import User model
import crypto from 'crypto';

// --- CORE MULTI-WISHLIST FUNCTIONS ---

const getMyWishlists = asyncHandler(async (req, res) => {
    // ✅ Use req.user._id for safer querying
    const wishlists = await Wishlist.find({ user: req.user._id })
        .populate('items.product', 'name image price') // ✅ Populate product, added price
        .populate('sharedWith', 'name email') // Populate shared users
        .sort({ createdAt: -1 }); // Sort newest first
    res.json(wishlists);
});

const createWishlist = asyncHandler(async (req, res) => {
    const { name, validUntil } = req.body;
    if (!name || name.trim() === '') {
        res.status(400);
        throw new Error('Wishlist name is required.');
    }
    const wishlist = await Wishlist.create({
        user: req.user._id, // ✅ Use req.user._id
        name: name,
        validUntil: validUntil || null,
        lastAccessed: new Date(),
    });
    // Populate the new wishlist before sending it back
    const populatedWishlist = await Wishlist.findById(wishlist._id)
        .populate('items.product', 'name image price')
        .populate('sharedWith', 'name email');
    res.status(201).json(populatedWishlist);
});

const addItemToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const wishlist = await Wishlist.findById(req.params.id);

    // ✅ Use req.user._id
    if (wishlist && wishlist.user.equals(req.user._id)) {
        const itemExists = wishlist.items.find(
            (item) => item.product && item.product.toString() === productId
        );
        if (itemExists) {
            return res.status(400).json({ message: 'Item already in this wishlist' });
        }
        wishlist.items.push({ product: productId });
        wishlist.lastAccessed = new Date();
        await wishlist.save();
        // Repopulate all fields after saving
        const populatedWishlist = await Wishlist.findById(wishlist._id)
            .populate('items.product', 'name image price')
            .populate('sharedWith', 'name email')
            .populate('user', 'name'); // Also populate the owner
        res.status(201).json(populatedWishlist);
    } else {
        res.status(404);
        throw new Error('Wishlist not found or you are not authorized.');
    }
});

const removeItemFromWishlist = asyncHandler(async (req, res) => {
    const wishlist = await Wishlist.findById(req.params.id);
    // ✅ Use req.user._id
    if (wishlist && wishlist.user.equals(req.user._id)) {
        wishlist.items = wishlist.items.filter(item => item._id.toString() !== req.params.itemId);
        wishlist.lastAccessed = new Date();
        await wishlist.save();
        res.json({ message: 'Item removed' }); // Frontend context will refetch or filter state
    } else {
        res.status(404);
        throw new Error('Wishlist not found or you are not authorized.');
    }
});

const deleteWishlist = asyncHandler(async (req, res) => {
    const wishlist = await Wishlist.findById(req.params.id);
    // ✅ Use req.user._id
    if (wishlist && wishlist.user.equals(req.user._id)) {
        await wishlist.deleteOne();
        res.json({ message: 'Wishlist removed' });
    } else {
        res.status(404);
        throw new Error('Wishlist not found or you are not authorized.');
    }
});

// --- SHARING & RATING FUNCTIONS ---

const getWishlistById = asyncHandler(async (req, res) => {
    const wishlist = await Wishlist.findByIdAndUpdate(
        req.params.id,
        { lastAccessed: new Date() },
        { new: true } // Return the updated document
    )
        .populate('items.product', 'name price image') // Populate product details
        .populate('user', 'name') // Populate owner's name
        .populate('sharedWith', 'name email') // Populate shared users
        .populate('items.ratings.user', 'name') // Populate user who rated
        .populate('chat.user', 'name'); // Populate user in chat

    if (wishlist) {
        const isOwner = wishlist.user.equals(req.user._id); // ✅ Use req.user._id
        const isSharedWith = wishlist.sharedWith.some(user => user._id.equals(req.user._id));
        if (isOwner || isSharedWith) {
            res.json(wishlist);
        } else {
            res.status(403);
            throw new Error('You do not have permission to view this wishlist.');
        }
    } else {
        res.status(404);
        throw new Error('Wishlist not found');
    }
});

const updateShareList = asyncHandler(async (req, res) => {
    const wishlist = await Wishlist.findById(req.params.id);
    // ✅ Use req.user._id
    if (wishlist && wishlist.user.equals(req.user._id)) {
        wishlist.sharedWith = req.body.sharedWith; // Expecting an array of user IDs
        wishlist.lastAccessed = new Date();
        await wishlist.save();
        const populated = await wishlist.populate('sharedWith', 'name email');
        res.json(populated);
    } else {
        res.status(404);
        throw new Error('Wishlist not found or you are not authorized.');
    }
});

const rateWishlistItem = asyncHandler(async (req, res) => {
    const { id: wishlistId, itemId } = req.params;
    const { voteType } = req.body;
    const userId = req.user._id; // ✅ Use req.user._id

    if (!['like', 'dislike'].includes(voteType)) {
        res.status(400); throw new Error('Invalid vote type.');
    }

    const wishlist = await Wishlist.findById(wishlistId);
    if (!wishlist) {
         res.status(404); throw new Error('Wishlist not found.');
    }

    const isOwner = wishlist.user.equals(userId);
    const isSharedWith = wishlist.sharedWith.some(id => id.equals(userId));

    if (!isOwner && !isSharedWith) {
        res.status(403); throw new Error('Not authorized to interact with this wishlist.');
    }

    const item = wishlist.items.id(itemId); // Find subdocument
    if (!item) {
        res.status(404); throw new Error('Wishlist item not found.');
    }

    if (!item.ratings) item.ratings = []; // Initialize if it doesn't exist
    const existingRating = item.ratings.find(r => r.user.equals(userId));

    if (existingRating) {
        if (existingRating.vote === voteType) { // Voted the same thing again
            item.ratings.pull(existingRating._id); // Remove the vote (toggle off)
        } else {
            existingRating.vote = voteType; // Change vote
        }
    } else {
        item.ratings.push({ user: userId, vote: voteType }); // Add new vote
    }

    wishlist.lastAccessed = new Date();
    await wishlist.save();

    // Repopulate everything before sending back
    const updatedWishlist = await Wishlist.findById(wishlistId)
        .populate('items.product', 'name price image')
        .populate('user', 'name')
        .populate('sharedWith', 'name email')
        .populate('items.ratings.user', 'name')
        .populate('chat.user', 'name');

    res.status(200).json(updatedWishlist);
});

const getSharedWithMe = asyncHandler(async (req, res) => {
    const wishlists = await Wishlist.find({ sharedWith: req.user._id }) // ✅ Use req.user._id
        .populate('user', 'name') // Populate the owner's name
        .populate('items.product', 'name image price') // Also populate items
        .sort({ lastAccessed: -1 }); // Sort by most recently accessed
    res.json(wishlists);
});

const addChatMessage = asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text || text.trim() === '') {
         res.status(400); throw new Error('Chat message cannot be empty.');
    }

    const wishlist = await Wishlist.findById(req.params.id);
    if (!wishlist) {
         res.status(404); throw new Error('Wishlist not found.');
    }

    const isOwner = wishlist.user.equals(req.user._id);
    const isSharedWith = wishlist.sharedWith.some(id => id.equals(req.user._id));
    if (!isOwner && !isSharedWith) {
        res.status(403); throw new Error('Not authorized to post in this chat.');
    }

    const message = { user: req.user._id, name: req.user.name, text: text };

    if (!wishlist.chat) wishlist.chat = [];
    wishlist.chat.push(message);
    wishlist.lastAccessed = new Date();
    await wishlist.save();

    res.status(201).json(message); // Send back just the new message (client can append)
});

// --- Note: Ensure these other functions are fully implemented ---

const generateShareLink = asyncHandler(async (req, res) => {
    // Example implementation:
    const wishlist = await Wishlist.findById(req.params.id);
    if (!wishlist || !wishlist.user.equals(req.user._id)) {
        res.status(404); throw new Error('Wishlist not found or unauthorized.');
    }
    if (!wishlist.shareToken) { // Create token if it doesn't exist
        wishlist.shareToken = crypto.randomBytes(20).toString('hex');
        wishlist.isPublic = true; // Make it public when share link is generated
        await wishlist.save();
    }
    res.json({ shareToken: wishlist.shareToken, shareUrl: `/wishlist/shared/${wishlist.shareToken}` });
});

const getSharedWishlist = asyncHandler(async (req, res) => {
    const wishlist = await Wishlist.findOne({ shareToken: req.params.token, isPublic: true })
        .populate('items.product', 'name price image')
        .populate('user', 'name') // Populate owner
        .populate('items.comments.user', 'name profilePicture'); // Populate comment users
     if (wishlist) {
        wishlist.lastAccessed = new Date();
        await wishlist.save();
        res.json(wishlist);
     } else {
        res.status(404); throw new Error('Shared wishlist not found or is no longer public.');
     }
});

const addComment = asyncHandler(async (req, res) => {
     // This logic might be complex depending on if it's item-specific or wishlist-specific
     // This stub assumes adding comment to a specific item via share link
     const { productId, text } = req.body;
     const wishlist = await Wishlist.findOne({ shareToken: req.params.token, isPublic: true });
     if (!wishlist) { res.status(404); throw new Error('Wishlist not found'); }

     const item = wishlist.items.find(i => i.product.equals(productId));
     if (!item) { res.status(404); throw new Error('Item not found in this wishlist'); }

     item.comments.push({ user: req.user._id, name: req.user.name, text: text });
     await wishlist.save();
     // Repopulate and send back
     const updatedWishlist = await Wishlist.findById(wishlist._id)
          .populate('items.product', 'name price image')
          .populate('user', 'name')
          .populate('items.comments.user', 'name profilePicture');
     res.status(201).json(updatedWishlist);
});

const addNoteToWishlistItem = asyncHandler(async (req, res) => {
    const { id: wishlistId, itemId } = req.params;
    const { note } = req.body;
    const wishlist = await Wishlist.findById(wishlistId);

    if (!wishlist || !wishlist.user.equals(req.user._id)) {
        res.status(404); throw new Error('Wishlist not found or unauthorized.');
    }
    const item = wishlist.items.id(itemId);
    if (!item) { res.status(404); throw new Error('Item not found.'); }

    item.notes = note || ''; // Set the note
    wishlist.lastAccessed = new Date();
    await wishlist.save();

    // Repopulate everything before sending back
    const updatedWishlist = await Wishlist.findById(wishlistId)
        .populate('items.product', 'name price image')
        .populate('user', 'name')
        .populate('sharedWith', 'name email')
        .populate('items.ratings.user', 'name')
        .populate('chat.user', 'name');

    res.json(updatedWishlist);
});

// --- Export Block ---
export {
    getMyWishlists, createWishlist, getWishlistById, addItemToWishlist,
    removeItemFromWishlist, deleteWishlist, updateShareList, getSharedWithMe,
    generateShareLink, getSharedWishlist, addComment, rateWishlistItem,
    addNoteToWishlistItem, addChatMessage
};