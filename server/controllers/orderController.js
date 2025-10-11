import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js'; // 1. Import User model
import Razorpay from 'razorpay';

// @desc    Create new order
const addOrderItems = asyncHandler(async (req, res) => {
    const { 
        orderItems, 
        shippingAddress, 
        paymentMethod,
        itemsPrice,
        taxPrice, 
        shippingPrice, 
        totalPrice,
        paymentResult 
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else {
        const order = new Order({
            orderItems: orderItems.map(item => ({ ...item, product: item.product })),
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentResult,
            isPaid: true,
            paidAt: Date.now(),
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    }
});

// @desc    Update order to paid
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
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

// @desc    Get logged in user orders
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
});

// ✅ 2. THIS FUNCTION IS NOW UPDATED FOR SEARCH
// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const keyword = req.query.keyword;
    
    let query = {};

    if (keyword) {
        // Find users whose name matches the keyword
        const users = await User.find({ name: { $regex: keyword, $options: 'i' } }).select('_id');
        const userIds = users.map(user => user._id);

        // Find products whose name matches the keyword
        const products = await Product.find({ name: { $regex: keyword, $options: 'i' } }).select('_id');
        const productIds = products.map(product => product._id);
        
        query = {
            $or: [
                { user: { $in: userIds } },
                { 'orderItems.product': { $in: productIds } }
            ]
        };
    }

    const orders = await Order.find({ ...query }).populate('user', 'id name');
    res.json(orders);
});


// @desc    Get order by ID
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get orders for the logged-in seller
const getMySales = asyncHandler(async (req, res) => {
    const sellerProducts = await Product.find({ user: req.user.id }).select('_id');
    const productIds = sellerProducts.map(p => p._id);

    const orders = await Order.find({ 'orderItems.product': { $in: productIds } })
        .populate('user', 'name email')
        .populate({
            path: 'orderItems.product',
            select: 'name user'
        });

    if (orders) {
        res.json(orders);
    } else {
        res.status(404);
        throw new Error('No sales found.');
    }
});

// @desc    Create a razorpay order
const createRazorpayOrder = asyncHandler(async (req, res) => {
    const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
        amount: req.body.amount,
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`,
    };

    try {
        const order = await instance.orders.create(options);
        if (!order) {
            res.status(500);
            throw new Error("Some error occurred");
        }
        res.json(order);
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});


export {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getOrders,
    getMySales,
    createRazorpayOrder
};

