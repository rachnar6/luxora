import crypto from 'crypto';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    
    const isAdmin = user.role === 'admin';
    const isSeller = user.role === 'seller';

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: isAdmin,
      isSeller: isSeller,
      profilePicture: user.profilePicture,
      sellerApplicationStatus: user.sellerApplicationStatus, // <-- ADD THIS LINE
      token: generateToken(user),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.role === 'admin',
      isSeller: user.role === 'seller',
      profilePicture: user.profilePicture,
      sellerApplicationStatus: user.sellerApplicationStatus, // <-- ADD THIS LINE
      token: generateToken(user),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.role === 'admin',
      isSeller: user.role === 'seller',
      profilePicture: user.profilePicture,
      sellerApplicationStatus: user.sellerApplicationStatus, // <-- ADD THIS LINE
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.role === 'admin',
      isSeller: updatedUser.role === 'seller',
      profilePicture: updatedUser.profilePicture,
      sellerApplicationStatus: updatedUser.sellerApplicationStatus, // <-- ADD THIS LINE
      token: generateToken(updatedUser),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});


// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        res.status(404);
        throw new Error('There is no user with that email address.');
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `http://localhost:3000/resetpassword/${resetToken}`;
    const message = `Forgot your password? Click the link to reset it: ${resetURL} \n\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message,
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!',
        });
    } catch (err) {
        console.error(err);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        throw new Error('There was an error sending the email. Try again later!');
    }
});

// @desc    Reset password
// @route   POST /api/auth/resetpassword/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error('Token is invalid or has expired');
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    res.status(200).json({
        status: 'success',
        message: 'Password successfully updated!',
        token: generateToken(user),
    });
});

export { 
    loginUser, 
    registerUser, 
    getUserProfile, 
    updateUserProfile, 
    forgotPassword,
    resetPassword,
};