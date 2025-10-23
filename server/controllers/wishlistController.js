import asyncHandler from 'express-async-handler';
import Wishlist from '../models/wishlistModel.js';
import crypto from 'crypto';

// --- CORE MULTI-WISHLIST FUNCTIONS ---

const getMyWishlists = asyncHandler(async (req, res) => {
  const wishlists = await Wishlist.find({ user: req.user.id })
    .populate('items.product', 'name image')
    .populate('sharedWith', 'name email')
    .sort({ createdAt: -1 });
  res.json(wishlists);
});

const createWishlist = asyncHandler(async (req, res) => {
  const { name, validUntil } = req.body;
  if (!name || name.trim() === '') {
    res.status(400);
    throw new Error('Wishlist name is required.');
  }
  const wishlist = await Wishlist.create({
    user: req.user._id,
    name: name,
    validUntil: validUntil || null,
    lastAccessed: new Date(),
  });
  res.status(201).json(wishlist);
});

const addItemToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const wishlist = await Wishlist.findById(req.params.id);

  if (wishlist && wishlist.user.equals(req.user.id)) {
    const itemExists = wishlist.items.find(
      (item) => item.product && item.product.toString() === productId
    );
    if (itemExists) {
      return res.status(400).json({ message: 'Item already in this wishlist' });
    }
    wishlist.items.push({ product: productId });
    wishlist.lastAccessed = new Date();
    await wishlist.save();
    const populatedWishlist = await Wishlist.findById(wishlist._id).populate('items.product');
    res.status(201).json(populatedWishlist);
  } else {
    res.status(404);
    throw new Error('Wishlist not found or you are not authorized.');
  }
});

const removeItemFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findById(req.params.id);
  if (wishlist && wishlist.user.equals(req.user.id)) {
    wishlist.items = wishlist.items.filter(item => item._id.toString() !== req.params.itemId);
    wishlist.lastAccessed = new Date();
    await wishlist.save();
    res.json({ message: 'Item removed' });
  } else {
    res.status(404);
    throw new Error('Wishlist not found or you are not authorized.');
  }
});

const deleteWishlist = asyncHandler(async (req, res) => {
    console.log('Controller: Received delete request for ID:', req.params.id); // <-- ADD LOG
    const wishlist = await Wishlist.findById(req.params.id);
    if (wishlist && wishlist.user.equals(req.user.id)) {
        await wishlist.deleteOne();
        console.log('Controller: Wishlist deleted successfully:', req.params.id); // <-- ADD LOG
        res.json({ message: 'Wishlist removed' });
    } else {
        console.log('Controller: Wishlist not found or unauthorized for ID:', req.params.id); // <-- ADD LOG
        res.status(404);
        throw new Error('Wishlist not found or you are not authorized.');
    }
});

// --- SHARING & RATING FUNCTIONS ---

const getWishlistById = asyncHandler(async (req, res) => {
    const wishlist = await Wishlist.findByIdAndUpdate(
        req.params.id, 
        { lastAccessed: new Date() }, 
        { new: true }
    )
        .populate('items.product', 'name price image')
        .populate('user', 'name')
        .populate('sharedWith', 'name email')
        .populate('items.ratings.user', 'name')
        .populate('chat.user', 'name');

    if (wishlist) {
        const isOwner = wishlist.user.equals(req.user.id);
        const isSharedWith = wishlist.sharedWith.some(user => user._id.equals(req.user.id));
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
    if (wishlist && wishlist.user.equals(req.user.id)) {
        wishlist.sharedWith = req.body.sharedWith;
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
    const userId = req.user._id;

    if (!['like', 'dislike'].includes(voteType)) {
        res.status(400); throw new Error('Invalid vote type.');
    }

    const wishlist = await Wishlist.findById(wishlistId);

    const isOwner = wishlist.user.equals(userId);
    const isSharedWith = wishlist.sharedWith.some(id => id.equals(userId));

    if (!wishlist || (!isOwner && !isSharedWith)) {
        res.status(403); throw new Error('Not authorized to interact with this wishlist.');
    }
    
    const item = wishlist.items.id(itemId);
    if (!item) {
        res.status(404); throw new Error('Wishlist item not found.');
    }

    if (!item.ratings) item.ratings = [];

    const existingRating = item.ratings.find(r => r.user.equals(userId));

    if (existingRating) {
        if (existingRating.vote === voteType) {
            item.ratings.pull(existingRating._id);
        } else {
            existingRating.vote = voteType;
        }
    } else {
        item.ratings.push({ user: userId, vote: voteType });
    }
    
    wishlist.lastAccessed = new Date();
    await wishlist.save();
    
    const updatedWishlist = await Wishlist.findById(wishlistId)
        .populate('user', 'name')
        .populate('items.product', 'name price image')
        .populate('sharedWith', 'name email')
        .populate('items.ratings.user', 'name')
        .populate('chat.user', 'name');

    res.status(200).json(updatedWishlist);
});

const getSharedWithMe = asyncHandler(async (req, res) => {
    const wishlists = await Wishlist.find({ sharedWith: req.user.id })
        .populate('user', 'name');
    res.json(wishlists);
});

const addChatMessage = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const wishlist = await Wishlist.findById(req.params.id);

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

    res.status(201).json(message);
});

const generateShareLink = asyncHandler(async (req, res) => { /* ... unchanged ... */ });
const getSharedWishlist = asyncHandler(async (req, res) => { /* ... unchanged ... */ });
const addComment = asyncHandler(async (req, res) => { /* ... unchanged ... */ });
const addNoteToWishlistItem = asyncHandler(async (req, res) => { /* ... unchanged ... */ });

export { 
  getMyWishlists, createWishlist, getWishlistById, addItemToWishlist,
  removeItemFromWishlist, deleteWishlist, updateShareList, getSharedWithMe,
  generateShareLink, getSharedWishlist, addComment, rateWishlistItem,
  addNoteToWishlistItem, addChatMessage
};
