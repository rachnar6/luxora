import express from 'express';
import { lookupUrl } from '../controllers/locationController.js';
import { protect } from '../middleware/authMiddleware.js'; // Use 'protect' if only logged-in users can use this

const router = express.Router();

router.route('/lookup-url').post(protect, lookupUrl); // Apply 'protect' middleware

export default router;