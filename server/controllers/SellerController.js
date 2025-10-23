// backend/controllers/sellerController.js (or userController.js)

import asyncHandler from '../utils/asyncHandler.js';
import Order from '../models/Order.js'; // Adjust path if needed
import Product from '../models/Product.js'; // Adjust path if needed
import Expense from '../models/Expense.js'; // Import the Expense model
import User from '../models/User.js'; // Import User model for profile functions
import mongoose from 'mongoose';

// @desc    Get seller profile for logged-in user
// @route   GET /api/seller/profile (or /api/users/seller/profile)
// @access  Private/Seller
const getSellerProfile = asyncHandler(async (req, res) => {
    // Find the logged-in user by ID provided by the 'protect' middleware
    const user = await User.findById(req.user._id).select('-password'); // Exclude password

    if (user && user.isSeller) {
        // Return relevant user and seller details
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            isSeller: user.isSeller,
            seller: user.seller // Nested seller information
        });
    } else {
        res.status(404);
        throw new Error('Seller profile not found or user is not a seller');
    }
});

// @desc    Update seller profile for logged-in user
// @route   PUT /api/seller/profile (or /api/users/seller/profile)
// @access  Private/Seller
const updateSellerProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user && user.isSeller) {
        // Ensure the 'seller' subdocument exists, create if not
        user.seller = user.seller || {};

        // Update fields based on request body, keeping existing values if not provided
        user.seller.brandName = req.body.brandName || user.seller.brandName;
        user.seller.bio = req.body.bio || user.seller.bio;
        user.seller.contactEmail = req.body.contactEmail || user.seller.contactEmail;

        // Ensure socialMedia object exists before updating nested properties
        user.seller.socialMedia = user.seller.socialMedia || {};
        // Use nullish coalescing (??) to allow clearing fields by sending null or empty string
        user.seller.socialMedia.instagram = req.body.socialMedia?.instagram ?? user.seller.socialMedia.instagram;
        user.seller.socialMedia.facebook = req.body.socialMedia?.facebook ?? user.seller.socialMedia.facebook;
        user.seller.socialMedia.twitter = req.body.socialMedia?.twitter ?? user.seller.socialMedia.twitter;

        const updatedUser = await user.save();

        // Return updated profile data
        res.json({
             _id: updatedUser._id,
             name: updatedUser.name,
             email: updatedUser.email,
             isAdmin: updatedUser.isAdmin,
             isSeller: updatedUser.isSeller,
             seller: updatedUser.seller
         });

    } else {
        res.status(404);
        throw new Error('Seller profile not found or user is not a seller');
    }
});


// @desc    Get sales & expense report data for the logged-in seller
// @route   GET /api/seller/reports (or /api/users/seller/reports)
// @access  Private/Seller
const getSellerReport = asyncHandler(async (req, res) => {
    const sellerId = new mongoose.Types.ObjectId(req.user._id); // Ensure it's an ObjectId

    // --- Define Time Periods ---
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday as start
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLast12Months = new Date(today.getFullYear(), today.getMonth() - 11, 1);

    try {
        // --- Perform Aggregations Concurrently ---
        const [
            overviewData,
            weeklySalesData,
            monthlySalesData,
            weeklyExpenseData,
            monthlyExpenseData,
            recentOrdersData,
            salesTrendData,
            expensesByCategoryData
        ] = await Promise.all([
            // 1. Overview (Total Sales & Orders for this seller)
            // Complex: Unwind items, lookup product, match seller, group back
            Order.aggregate([
                { $unwind: "$orderItems" }, // Split order into one doc per item
                { $lookup: { // Get product details for each item
                    from: "products", // The name of your products collection
                    localField: "orderItems.product",
                    foreignField: "_id",
                    as: "productInfo"
                }},
                { $unwind: "$productInfo" }, // Deconstruct the productInfo array
                { $match: { "productInfo.user": sellerId } }, // Match items sold by this seller
                { $group: { // Group by original order ID to get order-level stats
                    _id: "$_id", // Group by the main order ID
                    totalPriceForSellerItems: { $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] } }, // Sum item totals *within this order*
                    originalOrderTotal: { $first: "$totalPrice" } // Get the original order total once
                }},
                { $group: { // Final aggregation for overall totals
                    _id: null,
                    totalSales: { $sum: "$totalPriceForSellerItems" }, // Sum the seller's portion across all orders
                    totalOrders: { $addToSet: "$_id" } // Count unique order IDs
                }},
                { $project: { // Shape the output
                    _id: 0,
                    totalSales: 1,
                    totalOrders: { $size: "$totalOrders" } // Get the count from the set
                }}
            ]),
            // 2. Weekly Sales & Orders (Similar complex logic with date filter)
            Order.aggregate([
                { $match: { createdAt: { $gte: startOfWeek } } }, // Initial date filter
                { $unwind: "$orderItems" },
                { $lookup: { from: "products", localField: "orderItems.product", foreignField: "_id", as: "productInfo" }},
                { $unwind: "$productInfo" },
                { $match: { "productInfo.user": sellerId } },
                { $group: { _id: "$_id", totalPriceForSellerItems: { $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] } } }},
                { $group: { _id: null, sales: { $sum: "$totalPriceForSellerItems" }, orders: { $addToSet: "$_id" } }},
                { $project: { _id: 0, sales: 1, orders: { $size: "$orders" } }}
            ]),
             // 3. Monthly Sales & Orders (Similar complex logic with date filter)
             Order.aggregate([
                { $match: { createdAt: { $gte: startOfMonth } } },
                { $unwind: "$orderItems" },
                { $lookup: { from: "products", localField: "orderItems.product", foreignField: "_id", as: "productInfo" }},
                { $unwind: "$productInfo" },
                { $match: { "productInfo.user": sellerId } },
                { $group: { _id: "$_id", totalPriceForSellerItems: { $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] } } }},
                { $group: { _id: null, sales: { $sum: "$totalPriceForSellerItems" }, orders: { $addToSet: "$_id" } }},
                { $project: { _id: 0, sales: 1, orders: { $size: "$orders" } }}
            ]),
            // 4. Weekly Expenses (Simpler, uses Expense model)
            Expense.aggregate([
                 { $match: { user: sellerId, date: { $gte: startOfWeek } } },
                 { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            // 5. Monthly Expenses (Simpler)
            Expense.aggregate([
                { $match: { user: sellerId, date: { $gte: startOfMonth } } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
             // 6. Recent Orders containing items sold by this seller (More complex find)
            Order.find({ "orderItems.product": { $in: await Product.find({ user: sellerId }).distinct('_id') } }) // Find orders containing *any* product by this seller
                 .sort({ createdAt: -1 })
                 .limit(5)
                 .populate('user', 'name email') // Buyer's name
                 .select('orderNumber totalPrice totalAmount orderStatus paymentStatus createdAt shippingAddress user orderItems'), // Include orderItems to potentially filter/display seller items later
             // 7. Sales Trend (Last 12 Months - Complex aggregation)
             Order.aggregate([
                { $match: { createdAt: { $gte: startOfLast12Months } } }, // Filter by date first
                { $unwind: "$orderItems" },
                { $lookup: { from: "products", localField: "orderItems.product", foreignField: "_id", as: "productInfo" }},
                { $unwind: "$productInfo" },
                { $match: { "productInfo.user": sellerId } }, // Match seller
                { $group: { // Group by month/year AND order to sum seller's items per order
                     _id: {
                         year: { $year: "$createdAt" },
                         month: { $month: "$createdAt" },
                         orderId: "$_id" // Include orderId here
                     },
                     sellerSalesInOrder: { $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] } }
                 }},
                 { $group: { // Group again only by month/year to sum seller sales and count unique orders
                     _id: { year: "$_id.year", month: "$_id.month" },
                     sales: { $sum: "$sellerSalesInOrder" },
                     orders: { $addToSet: "$_id.orderId" } // Count unique orders containing seller items
                 }},
                { $project: { // Format output
                    _id: 1, // Keep year/month group
                    sales: 1,
                    orders: { $size: "$orders" } // Get count
                }},
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ]),
            // 8. Expenses by Category (Simpler)
            Expense.aggregate([
                { $match: { user: sellerId } },
                { $group: { _id: "$category", total: { $sum: "$amount" } }},
                { $sort: { total: -1 } }
            ])
        ]);

        // --- Process Aggregation Results ---
        const overview = overviewData[0] || { totalSales: 0, totalOrders: 0 };
        const weeklySales = weeklySalesData[0] || { sales: 0, orders: 0 };
        const monthlySales = monthlySalesData[0] || { sales: 0, orders: 0 };
        const weeklyExpensesTotal = weeklyExpenseData[0]?.total || 0;
        const monthlyExpensesTotal = monthlyExpenseData[0]?.total || 0;

        // --- Calculate Profit ---
        const weeklyProfit = weeklySales.sales - weeklyExpensesTotal;
        const monthlyProfit = monthlySales.sales - monthlyExpensesTotal;

        // --- Structure the Response ---
        const report = {
            overview: {
                totalSales: overview.totalSales,
                totalOrders: overview.totalOrders,
            },
            currentPeriod: {
                weekly: { sales: weeklySales.sales, orders: weeklySales.orders, expenses: weeklyExpensesTotal, profit: weeklyProfit },
                monthly: { sales: monthlySales.sales, orders: monthlySales.orders, expenses: monthlyExpensesTotal, profit: monthlyProfit }
            },
            // Note: recentOrdersData now includes all items, frontend might need to filter/display only seller's items if required
            recentOrders: recentOrdersData,
            salesTrend: salesTrendData,
            expensesByCategory: expensesByCategoryData
        };

        res.json(report);

    } catch (error) {
        console.error("Error generating seller report:", error);
        res.status(500);
        throw new Error('Server error while generating report');
    }
});

// @desc    Add a new expense for the logged-in seller
// @route   POST /api/seller/expenses (or /api/users/seller/expenses)
// @access  Private/Seller
const addSellerExpense = asyncHandler(async (req, res) => {
    const { title, description, amount, category, type, date } = req.body;

    // Basic validation
    if (!title || !amount || !category || !date) {
        res.status(400); // Bad Request
        throw new Error('Please provide title, amount, category, and date for the expense');
    }

    try {
        const expense = new Expense({
            user: req.user._id, // Link to the logged-in seller
            title,
            description,
            amount: Number(amount), // Ensure amount is stored as a number
            category,
            type, // Optional, defaults if not provided
            date: new Date(date), // Ensure date is stored as a Date object
        });

        const createdExpense = await expense.save();
        res.status(201).json(createdExpense); 

    } catch (error) {
        console.error("Error adding expense:", error);
        if (error.name === 'ValidationError') {
            res.status(400);
            const messages = Object.values(error.errors).map(val => val.message);
            throw new Error(messages.join(', '));
        } else {
            res.status(500); // Internal Server Error for other issues
            throw new Error('Server error while adding expense');
        }
    }
});

// @desc    Get PUBLIC sales report data for a specific seller
// @route   GET /api/seller/:id/report  (Adjust route prefix if needed)
// @access  Public
const getPublicSellerReport = asyncHandler(async (req, res) => {
    const sellerId = req.params.id;

    if (!mongoose.isValidObjectId(sellerId)) {
        res.status(400);
        throw new Error('Invalid Seller ID');
    }

    // --- Check if Seller Exists ---
    const sellerExists = await User.findOne({ _id: sellerId, isSeller: true });
    if (!sellerExists) {
        res.status(404);
        throw new Error('Seller not found');
    }

    // --- Define Time Periods ---
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfLast12Months = new Date(today.getFullYear(), today.getMonth() - 11, 1);

    try {
        // --- Perform Aggregations ---
        const [
            overviewData,
            salesTrendData,
            // Optional: Add top products aggregation here if desired
        ] = await Promise.all([
            // 1. Overview (Total Sales & Orders for this seller)
            Order.aggregate([
                { $unwind: "$orderItems" },
                { $lookup: { from: "products", localField: "orderItems.product", foreignField: "_id", as: "productInfo" }},
                { $unwind: "$productInfo" },
                { $match: { "productInfo.user": new mongoose.Types.ObjectId(sellerId) } },
                { $group: { _id: "$_id", totalPriceForSellerItems: { $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] } } }},
                { $group: { _id: null, totalSales: { $sum: "$totalPriceForSellerItems" }, totalOrders: { $addToSet: "$_id" } }},
                { $project: { _id: 0, totalSales: 1, totalOrders: { $size: "$totalOrders" } }}
            ]),
            // 2. Sales Trend (Last 12 Months for this seller)
             Order.aggregate([
                { $match: { createdAt: { $gte: startOfLast12Months } } },
                { $unwind: "$orderItems" },
                { $lookup: { from: "products", localField: "orderItems.product", foreignField: "_id", as: "productInfo" }},
                { $unwind: "$productInfo" },
                { $match: { "productInfo.user": new mongoose.Types.ObjectId(sellerId) } },
                { $group: {
                     _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, orderId: "$_id" },
                     sellerSalesInOrder: { $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] } }
                 }},
                 { $group: {
                     _id: { year: "$_id.year", month: "$_id.month" },
                     sales: { $sum: "$sellerSalesInOrder" },
                     orders: { $addToSet: "$_id.orderId" }
                 }},
                { $project: { _id: 1, sales: 1, orders: { $size: "$orders" } }},
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ]),
             // Example: Top 3 Selling Products (by quantity sold)
             // Order.aggregate([ ... complex aggregation involving products and sellerId ... ])
        ]);

        // --- Process Results ---
        const overview = overviewData[0] || { totalSales: 0, totalOrders: 0 };

        // --- Structure the Public Response (NO Expenses/Profit) ---
        const report = {
            overview: {
                totalSales: overview.totalSales,
                totalOrders: overview.totalOrders,
            },
            salesTrend: salesTrendData,
            // topProducts: topProductsData // Include if you added the aggregation
        };

        res.json(report);

    } catch (error) {
        console.error("Error generating public seller report:", error);
        res.status(500);
        throw new Error('Server error while generating report');
    }
});

export {
    getSellerProfile,
    updateSellerProfile,
    getSellerReport,
    addSellerExpense,
    getPublicSellerReport
};
