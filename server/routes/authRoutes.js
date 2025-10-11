import express from 'express';
import passport from 'passport';
import {
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
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

// @desc    Google auth callback (where Google redirects to after login)
// @route   GET /api/auth/google/callback
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:3000/login',
    session: false,
  }),
  (req, res) => {
    // On successful authentication, Passport attaches the user object to req.user.
    // CHANGED: Pass the full user object to generate the token.
    const token = generateToken(req.user);
    
    // Redirect the user back to the frontend, passing the token in the URL.
    res.redirect(`http://localhost:3000/login/success?token=${token}`);
  }
);

export default router;