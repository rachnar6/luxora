import asyncHandler from '../utils/asyncHandler.js';
import Product from '../models/Product.js';
import User from '../models/User.js'; // Ensure User model is imported if needed elsewhere
import mongoose from 'mongoose';

// @desc    Fetch all products with filtering
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    // Destructure all potential query parameters from req.query
    const { keyword, category, brand, minPrice, maxPrice, rating } = req.query;

    // Build the MongoDB query object dynamically
    let query = {};

    if (keyword) {
        // Case-insensitive regex search for product name
        query.name = { $regex: keyword, $options: 'i' };
    }
    if (category) {
        // Filter by exact category name (ensure case matches if your DB is case-sensitive)
        query.category = category;
    }
    if (brand) {
        // Filter by exact brand name
        query.brand = brand;
    }
    if (minPrice || maxPrice) {
        // Create price sub-object for range queries
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice); // Greater than or equal to minPrice
        if (maxPrice) query.price.$lte = Number(maxPrice); // Less than or equal to maxPrice
    }
    if (rating) {
        // Filter products with rating greater than or equal to the specified value
        query.rating = { $gte: Number(rating) };
    }

    // --- Optional: Add console logs for debugging ---
    // console.log('Backend received query params:', req.query);
    // console.log('Constructed MongoDB query:', query);
    // --- End Debugging ---

    try {
        // Execute the query, finding products that match the filter object
        const products = await Product.find(query)
            // Populate the 'user' field (referenced by 'user' in Product model)
            // Select specific fields from the User model to send back
            .populate('user', '_id name isAdmin isSeller seller.brandName');

        // --- Optional: Log count for debugging ---
        // console.log(`Found ${products.length} products matching query.`);
        // --- End Debugging ---

        res.json(products); // Send the found products as JSON response
    } catch (dbError) {
        console.error('Database Query Error in getProducts:', dbError);
        res.status(500); // Internal Server Error
        throw new Error('Server error fetching products'); // Let asyncHandler handle the error response
    }
});

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400);
        throw new Error('Invalid product ID');
    }
    const product = await Product.findById(req.params.id)
        .populate('user', '_id name isAdmin isSeller seller.brandName'); // Populate necessary user fields

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
    const deals = await Product.find({ isDeal: true }) // Filter where isDeal is true
        .sort({ createdAt: -1 }) // Sort by newest first
        .populate('user', '_id name isAdmin isSeller seller.brandName'); // Populate user info
    res.json(deals);
});

// @desc    Get top selling products
// @route   GET /api/products/top-selling
// @access  Public
const getTopSellingProducts = asyncHandler(async (req, res) => {
    const topSelling = await Product.find({}) // Find all products initially
        .sort({ salesCount: -1 }) // Sort by salesCount descending
        .limit(10) // Limit to top 10
        .populate('user', '_id name isAdmin isSeller seller.brandName'); // Populate user info
    res.json(topSelling);
});

// @desc    Get latest products
// @route   GET /api/products/latest
// @access  Public
const getLatestProducts = asyncHandler(async (req, res) => {
    const latest = await Product.find({}) // Find all products initially
        .sort({ createdAt: -1 }) // Sort by creation date descending (newest first)
        .limit(10) // Limit to newest 10
        .populate('user', '_id name isAdmin isSeller seller.brandName'); // Populate user info
    res.json(latest);
});

// @desc    Create a product (for Seller/Admin)
// @route   POST /api/products
// @access  Private/Seller or Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    // req.user is added by the authentication middleware
    const { name, price, description, image, brand, category, countInStock } = req.body;
    const product = new Product({
        user: req.user._id, // Set the product owner to the logged-in user
        name: name || 'Sample Name',
        price: price || 0,
        description: description || 'Sample description',
        image: image || '/images/sample.jpg', // Default image path
        brand: brand || 'Sample Brand',
        category: category || 'Sample Category',
        countInStock: countInStock || 0,
        numReviews: 0, // Initialize reviews and rating
        rating: 0,
        // salesCount will default based on the schema
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct); // Respond with 201 Created status
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Seller or Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const { name, price, description, image, brand, category, countInStock, isDeal } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        // Authorization check: User must be admin or the product's owner
        if (product.user.toString() !== req.user.id && !req.user.isAdmin) {
            res.status(401); // Unauthorized
            throw new Error('Not authorized to update this product');
        }

        // Update fields only if they are provided in the request body
        product.name = name || product.name;
        product.price = price !== undefined ? price : product.price; // Allow setting price to 0
        product.description = description || product.description;
        product.image = image || product.image;
        product.brand = brand || product.brand;
        product.category = category || product.category;
        product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
        product.isDeal = isDeal !== undefined ? isDeal : product.isDeal; // Allow updating deal status

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Seller or Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
         // Authorization check: User must be admin or the product's owner
        if (product.user.toString() !== req.user.id && !req.user.isAdmin) {
            res.status(401); // Unauthorized
            throw new Error('Not authorized to delete this product');
        }
        await product.deleteOne(); // Use deleteOne() method on the document
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create a new review
// @route   POST /api/products/:id/reviews
// @access  Private (Logged-in users)
const createProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    if (!mongoose.isValidObjectId(productId)) {
        res.status(400);
        throw new Error('Invalid product ID');
    }

    const product = await Product.findById(productId);

    if (product) {
        // Check if the user has already reviewed this product
        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            res.status(400);
            throw new Error('Product already reviewed');
        }

        // Create the new review object
        const review = {
            name: req.user.name, // User's name from logged-in user info
            rating: Number(rating),
            comment,
            user: req.user._id, // Link review to the user ID
            // createdAt is automatically added by schema timestamps: true
        };

        product.reviews.push(review); // Add review to the product's reviews array
        product.numReviews = product.reviews.length; // Update review count
        // Calculate new average rating
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save(); // Save changes to the product document
        res.status(201).json({ message: 'Review added' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Fetch products created by the logged-in seller
// @route   GET /api/products/myproducts
// @access  Private/Seller
const getMyProducts = asyncHandler(async (req, res) => {
    // Authorization check (should also be done in middleware)
    if (!req.user || !req.user.isSeller) {
        res.status(401);
        throw new Error('Not authorized as a seller');
    }
    const products = await Product.find({ user: req.user._id }) // Find products where user field matches logged-in user ID
       .populate('user', '_id name isAdmin isSeller seller.brandName'); // Populate user info
    res.json(products);
});

// @desc    Get all unique categories
// @route   GET /api/products/categories
// @access  Public
const getUniqueCategories = asyncHandler(async (req, res) => {
    // Fetch distinct category values from the Product collection
    const categories = await Product.distinct('category');
    res.json(categories);
});

// @desc    Get unique brands, optionally filtered by category
// @route   GET /api/products/brands
// @access  Public
const getUniqueBrands = asyncHandler(async (req, res) => {
    const { category } = req.query;
    const filter = category ? { category: category } : {}; // Create filter object if category exists
    // Fetch distinct brand values, applying filter if present
    const brands = await Product.distinct('brand', filter);
    res.json(brands);
});

// @desc    Get related products by category
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400);
        throw new Error('Invalid product ID');
    }
    const product = await Product.findById(req.params.id);

    if (product) {
        const relatedProducts = await Product.find({
            category: product.category, // Find products in the same category
            _id: { $ne: product._id }   // Exclude the current product itself
        })
        .limit(4) // Limit to 4 related products
        .populate('user', '_id name isAdmin isSeller seller.brandName'); // Populate user info
        res.json(relatedProducts);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Get all products for a specific seller ID
// @route   GET /api/products/seller/:id
// @access  Public
const getProductsBySeller = asyncHandler(async (req, res) => {
    const sellerId = req.params.id;
    if (!mongoose.isValidObjectId(sellerId)) {
        res.status(400);
        throw new Error('Invalid seller ID');
    }

    // Find the seller user, ensuring they are marked as a seller
    const seller = await User.findById(sellerId).select('name profilePicture isSeller seller'); // Select necessary fields

    if (!seller || !seller.isSeller) {
        res.status(404);
        throw new Error('Seller not found');
    }

    // Find all products where the user field matches the sellerId
    const products = await Product.find({ user: sellerId })
        .populate('user', '_id name isAdmin isSeller seller.brandName'); // Populate user info on products too

    // Return seller profile info and their products
    res.json({
        seller: { // Construct a public seller profile object
            _id: seller._id,
            name: seller.name,
            profilePicture: seller.profilePicture,
            brandName: seller.seller?.brandName,
            bio: seller.seller?.bio,
            contactEmail: seller.seller?.contactEmail,
            socialMedia: seller.seller?.socialMedia,
            logo: seller.seller?.logo,
        },
        products: products
    });
});


// Export all controller functions
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
    getMyProducts,
    getRelatedProducts,
    getProductsBySeller
};