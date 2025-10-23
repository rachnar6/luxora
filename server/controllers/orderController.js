import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Razorpay from 'razorpay';
import mongoose from 'mongoose'; // Import mongoose

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
    const {
        orderItems, shippingAddress, paymentMethod, itemsPrice, // Focus on itemsPrice
        taxPrice, shippingPrice, totalPrice, paymentResult
    } = req.body;

    // --- 👇 Log the incoming request body ---
    console.log("--- addOrderItems: Received req.body ---");
    console.log(JSON.stringify(req.body, null, 2));
    console.log(`Received itemsPrice type: ${typeof itemsPrice}, value: ${itemsPrice}`);
    // --- End Log ---

    if (!orderItems || orderItems.length === 0) { /* ... error handling ... */ }

    const processedOrderItems = orderItems.map(item => ({ ...item, product: item.product }));

    const order = new Order({
        orderItems: processedOrderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        // --- 👇 Check the value being assigned ---
        itemsPrice: Number(itemsPrice) || 0, // Ensure it's a number, default to 0 if NaN/undefined
        taxPrice: Number(taxPrice) || 0,
        shippingPrice: Number(shippingPrice) || 0,
        totalPrice: Number(totalPrice) || 0,
        // --- End Check ---
        isPaid: !!paymentResult,
        paidAt: paymentResult ? Date.now() : null,
        paymentResult: paymentResult || null,
        orderStatus: 'Pending',
        trackingHistory: [{ status: 'Pending', updatedAt: Date.now() }],
    });

    // --- 👇 Log the order object *before* saving ---
    console.log("--- addOrderItems: Order object BEFORE save ---");
    console.log(JSON.stringify(order.toObject(), null, 2)); // Use .toObject() for cleaner logging
    

    try {
        const createdOrder = await order.save();
        // --- 👇 Log the order object *after* saving ---
        console.log("--- addOrderItems: Order object AFTER save ---");
        console.log(JSON.stringify(createdOrder.toObject(), null, 2));
        

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error("Error saving order:", error);
        res.status(500);
        throw new Error("Could not save order to database.");
    }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (User who owns it or Admin)
const getOrderById = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400);
        throw new Error('Invalid Order ID');
    }

    // Populate buyer's name and email
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
        // Authorization check: Allow buyer or admin
        if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
             res.status(403); // Forbidden
             throw new Error('Not authorized to view this order');
        }
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});


// @desc    Update order to paid (e.g., after successful external payment)
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
     if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400);
        throw new Error('Invalid Order ID');
    }
    const order = await Order.findById(req.params.id);

    if (order) {
        // Simple authorization: Only the buyer or admin can mark as paid
        if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            res.status(403);
            throw new Error('Not authorized to update payment status');
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentStatus = 'Paid'; // Assuming you add paymentStatus field
        order.paymentResult = { // Store payment details from request body
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address,
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get logged in user's orders (as Buyer)
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    // Find orders where the 'user' field matches the logged-in buyer's ID
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }); // Sort newest first
    res.json(orders);
});

// @desc    Get all orders (Admin only) with optional search
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const keyword = req.query.keyword;
    let query = {};

    if (keyword) {
        // Find users (buyers) whose name matches
        const users = await User.find({ name: { $regex: keyword, $options: 'i' } }).select('_id');
        const userIds = users.map(user => user._id);

        // Find products whose name matches
        const products = await Product.find({ name: { $regex: keyword, $options: 'i' } }).select('_id');
        const productIds = products.map(product => product._id);

        // Build $or query to match orders by buyer OR containing a matching product
        query = {
            $or: [
                { user: { $in: userIds } }, // Match buyer ID
                { 'orderItems.product': { $in: productIds } } // Match product ID within items
            ]
        };
    }

    // Find orders matching the query (or all if no keyword)
    const orders = await Order.find({ ...query })
        .populate('user', 'id name') // Populate buyer's ID and name
        .sort({ createdAt: -1 }); // Sort newest first
    res.json(orders);
});


// @desc    Get orders containing items sold by the logged-in seller
// @route   GET /api/orders/mysales
// @access  Private/Seller
const getMySales = asyncHandler(async (req, res) => {
    const sellerId = req.user._id;

    // Find Product IDs belonging to the seller
    const sellerProducts = await Product.find({ user: sellerId }).select('_id');
    const productIds = sellerProducts.map(p => p._id);

    if (productIds.length === 0) {
        return res.json([]); // Return empty array if seller has no products
    }

    // Find Orders that contain at least one product from the seller's product list
    const orders = await Order.find({ 'orderItems.product': { $in: productIds } })
        .populate('user', 'name email') // Populate Buyer's details

        // 👇👇👇 THIS POPULATE BLOCK IS CRUCIAL 👇👇👇
        .populate({
            path: 'orderItems.product', // Populate product details within orderItems
            select: 'name price user image', // Select fields needed from Product model
            populate: {
                path: 'user', // ✅ Populate the Seller info (user field) within the Product model
                select: 'name _id' // Select Seller's name and ID (ID is needed for frontend filter)
            }
        })
        .sort({ createdAt: -1 }); // Sort newest first

    res.json(orders);
});

// @desc    Create a Razorpay order ID
// @route   POST /api/orders/razorpay
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        res.status(500);
        throw new Error('Razorpay credentials not configured');
    }
    const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
        amount: Math.round(Number(req.body.amount) * 100), // Amount in paise/cents
        currency: "INR",
        receipt: `receipt_order_${new Date().getTime()}`, // More unique receipt
    };

    try {
        const order = await instance.orders.create(options);
        if (!order) {
            res.status(500);
            throw new Error("Razorpay order creation failed");
        }
        res.json(order); // Send back Razorpay order details (including ID)
    } catch (error) {
        console.error("Razorpay Error:", error);
        res.status(500);
        throw new Error(error.message || "Failed to create Razorpay order");
    }
});


// @desc    Update order status by Seller (or Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Seller or Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400);
        throw new Error('Invalid Order ID');
    }
    // Populate product user for authorization check
    const order = await Order.findById(req.params.id).populate('orderItems.product', 'user');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // --- Authorization Check ---
    const isSellerOfItem = order.orderItems.some(
        item => item.product?.user?.toString() === req.user._id.toString()
    );

    // Allow if the user is an Admin OR the seller of an item in this order
    if (!req.user.isAdmin && !isSellerOfItem) {
         res.status(403); // Forbidden
         throw new Error('Not authorized to update this order status');
    }
    // --- End Authorization Check ---

    const { status } = req.body; // Get the new status from the request body

    const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
        res.status(400);
        throw new Error(`Invalid status: ${status}. Must be one of: ${allowedStatuses.join(', ')}`);
    }

    // Update the main status field
    order.orderStatus = status;

    // Update deliveredAt timestamp if status is 'Delivered'
    if (status === 'Delivered' && !order.isDelivered) {
         order.isDelivered = true;
         order.deliveredAt = Date.now();
    } else if (status !== 'Delivered' && order.isDelivered) {
        // Optional: Clear delivery status if changed away from Delivered?
        // order.isDelivered = false;
        // order.deliveredAt = null;
    }

    // Add status change to tracking history
    order.trackingHistory = order.trackingHistory || [];
    // Add only if the new status is different from the last one in history
    if (!order.trackingHistory.length || order.trackingHistory[order.trackingHistory.length - 1].status !== status) {
        order.trackingHistory.push({ status: status, updatedAt: Date.now() });
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
});


const requestOrderItemReturn = asyncHandler(async (req, res) => {
    const { reason } = req.body; // Get reason from request body
    const orderId = req.params.id;
    const orderItemId = req.params.itemId; // Get item ID from URL

    if (!reason) {
        res.status(400);
        throw new Error('Return reason is required');
    }
    if (!mongoose.isValidObjectId(orderId) || !mongoose.isValidObjectId(orderItemId)) {
        res.status(400);
        throw new Error('Invalid Order or Item ID');
    }

    const order = await Order.findById(orderId);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Authorization: Ensure the logged-in user is the buyer of this order
    if (order.user.toString() !== req.user._id.toString()) {
        res.status(403); // Forbidden
        throw new Error('Not authorized to modify this order');
    }

    // Find the specific item within the order
    const itemToReturn = order.orderItems.id(orderItemId); // Use .id() to find subdocument by ID

    if (!itemToReturn) {
        res.status(404);
        throw new Error('Order item not found');
    }

    // Check if return is allowed (e.g., already requested, order status)
    if (itemToReturn.returnStatus !== 'None') {
         res.status(400);
         throw new Error(`Item return status is already '${itemToReturn.returnStatus}'`);
    }
    // Optional: Add checks based on orderStatus (e.g., only allow if Delivered)
    // if (order.orderStatus !== 'Delivered') {
    //     res.status(400);
    //     throw new Error('Cannot request return for items not yet delivered');
    // }

    // Update the item's return status
    itemToReturn.returnStatus = 'Requested';
    itemToReturn.returnReason = reason;
    itemToReturn.returnRequestedAt = Date.now();

    // Add entry to overall order tracking maybe? (Optional)
    order.trackingHistory.push({ status: `Return Requested for item ${itemToReturn.name}`, updatedAt: Date.now() });

    const updatedOrder = await order.save();
    res.json(updatedOrder); // Send back the updated order
});

export {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    getMyOrders, // Buyer's orders
    getOrders,   // Admin: Get all orders (with search)
    getMySales,  // Seller's orders
    createRazorpayOrder,
    updateOrderStatus,
    requestOrderItemReturn 
};