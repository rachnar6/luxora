import express from 'express';
import passport from 'passport';
import {
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import generateToken from '../utils/generateToken.js';

const router = express.Router();

// Email/password routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

// --- Google OAuth Routes ---

// @desc    Authenticate user with Google (starts the process)
// @route   GET /api/auth/google
// @access  Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword/:token', resetPassword);

// @desc    Google auth callback (where Google redirects to after login)
// @route   GET /api/auth/google/callback
// @access  Public
router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL}/login`,
    }),
    (req, res) => {
        res.redirect(`${process.env.FRONTEND_URL}/login/success`);
    }
);

export default router;