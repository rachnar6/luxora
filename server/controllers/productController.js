import asyncHandler from '../utils/asyncHandler.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// @desc    Fetch all products with filtering
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const { keyword, category, brand, minPrice, maxPrice, rating } = req.query;

    let query = {};

    if (keyword) {
        query.name = { $regex: keyword, $options: 'i' };
    }
    if (category) {
        query.category = category;
    }
    if (brand) {
        query.brand = brand;
    }
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    // ✅ ADD THIS RATING LOGIC
    if (rating) {
        query.rating = { $gte: Number(rating) };
    }

    const products = await Product.find(query);
    res.json(products);
});


// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400);
        throw new Error('Invalid product ID');
    }
    const product = await Product.findById(req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Get products marked as deals
// @route   GET /api/products/deals
// @access  Public
const getDeals = asyncHandler(async (req, res) => {
    const deals = await Product.find({ isDeal: true }).sort({ createdAt: -1 });
    res.json(deals);
});

// @desc    Get top selling products
// @route   GET /api/products/top-selling
// @access  Public
const getTopSellingProducts = asyncHandler(async (req, res) => {
    const topSelling = await Product.find({}).sort({ salesCount: -1 }).limit(10);
    res.json(topSelling);
});


const getLatestProducts = asyncHandler(async (req, res) => {
    const latest = await Product.find({}).sort({ createdAt: -1 }).limit(10);
    res.json(latest);
});


const createProduct = asyncHandler(async (req, res) => {
    const { name, price, description, image, brand, category, countInStock } = req.body;
    const product = new Product({ 
        user: req.user._id, 
        name, 
        price, 
        description, 
        image, 
        brand, 
        category, 
        countInStock 
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});


const updateProduct = asyncHandler(async (req, res) => {
    const { name, price, description, image, brand, category, countInStock } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        // Ownership check: only the product owner or an admin can update
        if (product.user.toString() !== req.user.id && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('Not authorized to update this product');
        }
        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;
        product.image = image || product.image;
        product.brand = brand || product.brand;
        product.category = category || product.category;
        product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
        
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Seller
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        // Ownership check: only the product owner or an admin can delete
        if (product.user.toString() !== req.user.id && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('Not authorized to delete this product');
        }
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create a new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user.id.toString());
        if (alreadyReviewed) {
            res.status(400);
            throw new Error('Product already reviewed');
        }
        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user.id,
        };
        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
        await product.save();
        res.status(201).json({ message: 'Review added' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Fetch all products for a specific seller (for public view)
// @route   GET /api/products/seller/:id
// @access  Public
const getProductsBySeller = asyncHandler(async (req, res) => {
    const products = await Product.find({ user: req.params.id });
    res.json(products);
});

// --- ADD THIS NEW FUNCTION ---
// @desc    Fetch products created by the logged-in seller
// @route   GET /api/products/myproducts
// @access  Private/Seller
const getMyProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ user: req.user.id });
    res.json(products);
});

// @desc    Get all unique categories
// @route   GET /api/products/categories
// @access  Public
const getUniqueCategories = asyncHandler(async (req, res) => {
    const categories = await Product.distinct('category');
    res.json(categories);
});

// @desc    Get unique brands, optionally filtered by category
// @route   GET /api/products/brands
// @access  Public
const getUniqueBrands = asyncHandler(async (req, res) => {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const brands = await Product.distinct('brand', filter);
    res.json(brands);
});

// @desc    Get related products by category
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id } // Exclude the current product
        }).limit(4); // Show up to 4 related products

        res.json(relatedProducts);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

export {
    getProducts,
    getProductById,
    getUniqueCategories,
    getUniqueBrands,
    getDeals,
    getTopSellingProducts,
    getLatestProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductsBySeller,
    getMyProducts,
    getRelatedProducts
};