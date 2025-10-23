import express from 'express';
import {
    getProducts,
    getProductById,
    getUniqueCategories,
    getDeals,
    getTopSellingProducts,
    getLatestProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductsBySeller,
    getUniqueBrands,
    getMyProducts,
    getRelatedProducts
} from '../controllers/productController.js';
import { protect, seller } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// --- Root and Static Routes (Define These First) ---

// @route   GET /api/products and POST /api/products
router.route('/').get(getProducts).post(protect, seller, createProduct);

// @route   GET /api/products/categories
router.get('/categories', getUniqueCategories);

// @route   GET /api/products/brands
router.get('/brands', getUniqueBrands);

// @route   GET /api/products/deals
router.get('/deals', getDeals);

// @route   GET /api/top-selling
router.get('/top-selling', getTopSellingProducts);

// @route   GET /api/products/latest
router.get('/latest', getLatestProducts);

// --- Dynamic Routes (Define These After Static Routes) ---

// @route   GET /api/products/seller/:id
router.get('/seller/:id', getProductsBySeller);

router.route('/myproducts').get(protect, seller, getMyProducts); // ADD THIS ROUTE

// @route   POST /api/products/:id/reviews
router.route('/:id/reviews').post(
    protect,
    upload.array('media', 5),
    createProductReview
);

router.route('/:id/related').get(getRelatedProducts);

// @route   GET, PUT, DELETE /api/products/:id
// This must be one of the last routes so it doesn't accidentally catch '/brands', etc.
router.route('/:id')
    .get(getProductById)
    .put(protect, seller, updateProduct)
    .delete(protect, seller, deleteProduct);

export default router;