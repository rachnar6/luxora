import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';

// @desc    Allow a user to apply to become a seller
// @route   POST /api/users/apply-seller
// @access  Private
const applyToBeSeller = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role !== 'user' || user.seller.status === 'Pending') {
    res.status(400);
    throw new Error('Cannot apply at this time.');
  }

  user.seller.status = 'Pending';
  await user.save();

  res.status(200).json({
    message: 'Seller application submitted successfully.',
  });
});


// --- ADD THIS NEW FUNCTION ---
// @desc    Delete user profile
// @route   DELETE /api/users/profile
// @access  Private
const deleteUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if(user) {
        await user.deleteOne();
        res.json({ message: 'User profile deleted successfully' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get users for sharing (search by name/email)
// @route   GET /api/users/search
// @access  Private
const searchUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.keyword 
        ? {
            $or: [
                { name: { $regex: req.query.keyword, $options: 'i' } },
                { email: { $regex: req.query.keyword, $options: 'i' } },
            ],
            // Ensure we don't return the logged-in user in the search
            _id: { $ne: req.user._id }
        }
        : {};

    const users = await User.find(keyword).select('name email').limit(10);
    res.json(users);
});

// @desc    Get user's saved shipping addresses
// @route   GET /api/users/addresses
// @access  Private
const getUserAddresses = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.json(user.shippingAddresses);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Add a new shipping address
// @route   POST /api/users/addresses
// @access  Private
const addShippingAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        const { address, city, postalCode, country } = req.body;
        
        const newAddress = { address, city, postalCode, country };
        
        user.shippingAddresses.push(newAddress);
        
        await user.save();
        res.status(201).json(user.shippingAddresses);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});



// --- UPDATE THE EXPORT LIST ---
export { applyToBeSeller, deleteUserProfile, searchUsers, getUserAddresses, addShippingAddress };