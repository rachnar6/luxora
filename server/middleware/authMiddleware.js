import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// Checks if user is logged in
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).send('Not authorized, token failed');
    }
  }
  if (!token) {
    res.status(401).send('Not authorized, no token');
  }
};

// Checks if user is an admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // If user is an admin, continue
  } else {
    res.status(401).send('Not authorized as an admin');
  }
};

const seller = (req, res, next) => {
  if (req.user && req.user.isSeller) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as a seller');
  }
};

const isSeller = (req, res, next) => {
    // Check if user is attached by 'protect' and if isSeller is true
    if (req.user && req.user.isSeller) {
        next(); // User is a seller, proceed
    } else {
        res.status(403); // Forbidden status
        throw new Error('Not authorized as a seller');
    }
};

export { protect, admin, seller, isSeller };