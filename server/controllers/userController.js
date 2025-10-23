import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js'; // Added generateToken import

// @desc    Allow a user to apply to become a seller
// @route   POST /api/users/apply-seller
// @access  Private
const applyToBeSeller = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // --- START FIX ---
  // Check the correct top-level field 'sellerApplicationStatus'
  // Also check if they are already a seller
  if (user.isSeller || user.sellerApplicationStatus === 'pending' || user.sellerApplicationStatus === 'approved') {
    res.status(400);
    throw new Error('Cannot apply at this time.');
  }

  // Set the correct top-level field
  user.sellerApplicationStatus = 'pending';
  // --- END FIX ---
  
  await user.save();

  res.status(200).json({
    message: 'Seller application submitted successfully.',
    // Send back the new status so the frontend can update
    sellerApplicationStatus: user.sellerApplicationStatus, 
  });
});


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
    const { address, city, postalCode, country } = req.body;

    const user = await User.findById(req.user._id);

    if (user) {
        const newAddress = { address, city, postalCode, country };
        user.shippingAddresses.push(newAddress);
        await user.save();
        res.status(201).json(user.shippingAddresses);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});


// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            isSeller: user.isSeller,
            isAdmin: user.role === 'admin', // Use the 'role' field to determine this
            sellerApplicationStatus: user.sellerApplicationStatus, // <-- ADD THIS
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = req.body.password;
        }

        if (req.file) {
            user.profilePicture = `/uploads/profile_pictures/${req.file.filename}`;
        } else if (req.body.profilePicture === '/images/default-avatar.png') {
            user.profilePicture = '/images/default-avatar.png';
        }

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            profilePicture: updatedUser.profilePicture,
            isSeller: updatedUser.isSeller,
            isAdmin: updatedUser.role === 'admin', // Use the 'role' field
            sellerApplicationStatus: updatedUser.sellerApplicationStatus, // <-- ADD THIS
            token: generateToken(updatedUser), // Regenerate token
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get seller profile
// @route   GET /api/users/seller/profile
// @access  Private/Seller
const getSellerProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user && user.isSeller) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      seller: user.seller, // Send back the seller-specific info
    });
  } else {
    res.status(404);
    throw new Error('User not found or is not a seller');
  }
});

// @desc    Update seller profile
// @route   PUT /api/users/seller/profile
// @access  Private/Seller
const updateSellerProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user && user.isSeller) {
    // Update the seller object
    user.seller.brandName = req.body.brandName || user.seller.brandName;
    user.seller.bio = req.body.bio || user.seller.bio;
    user.seller.contactEmail = req.body.contactEmail || user.seller.contactEmail;
    
    // Update social media
    if (req.body.socialMedia) {
      user.seller.socialMedia.instagram = req.body.socialMedia.instagram || user.seller.socialMedia.instagram;
      user.seller.socialMedia.facebook = req.body.socialMedia.facebook || user.seller.socialMedia.facebook;
      user.seller.socialMedia.twitter = req.body.socialMedia.twitter || user.seller.socialMedia.twitter;
    }
    
    // You can add logo upload logic here later

    const updatedUser = await user.save();

    // Send back the updated user object
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isSeller: updatedUser.isSeller,
      seller: updatedUser.seller,
      // Also send back other fields your AuthContext needs
      isAdmin: updatedUser.role === 'admin',
      profilePicture: updatedUser.profilePicture,
      sellerApplicationStatus: updatedUser.sellerApplicationStatus,
      token: generateToken(updatedUser), // Send a new token
    });
  } else {
    res.status(404);
    throw new Error('User not found or is not a seller');
  }
});

export { 
    applyToBeSeller, 
    deleteUserProfile, 
    searchUsers, 
    getUserAddresses, 
    addShippingAddress, 
    getUserProfile, 
    updateUserProfile,
    getSellerProfile,
    updateSellerProfile
};