import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// --- USER MANAGEMENT ---

const getUsers = asyncHandler(async (req, res) => {
  // This is the correct code to show ONLY regular users
  const users = await User.find({ role: 'user' });
  res.json(users);
});

// @desc    Delete a user
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Cannot delete an admin user.');
    }
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user by ID
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user by ID
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    
    // --- FIX ---
    // Also update isSeller if the role is changed to seller
    if(req.body.role === 'seller') {
        user.isSeller = true;
    }
    // --- END FIX ---

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// --- PRODUCT MANAGEMENT ---

const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({});
    res.json(products);
});

const createProduct = asyncHandler(async (req, res) => {
    const product = new Product({
        name: 'Sample Name',
        price: 0,
        user: req.user._id, // This should be the admin or seller ID
        image: '/images/sample.jpg',
        brand: 'Sample Brand',
        category: 'Sample Category',
        countInStock: 0,
        numReviews: 0,
        description: 'Sample description',
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

const updateProduct = asyncHandler(async (req, res) => {
    const { name, price, description, image, brand, category, countInStock } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name;
        product.price = price;
        product.description = description;
        product.image = image;
        product.brand = brand;
        product.category = category;
        product.countInStock = countInStock;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// --- ORDER MANAGEMENT ---

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

const updateOrderToDelivered = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if(order){
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// --- SELLER APPLICATION MANAGEMENT ---

const getSellerApplications = asyncHandler(async (req, res) => {
  // --- FIX ---
  // Querying the correct field: 'sellerApplicationStatus'
  const pendingUsers = await User.find({ sellerApplicationStatus: 'pending' });
  // --- END FIX ---
  res.json(pendingUsers);
});

const approveSellerApplication = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    // --- FIX ---
    // Set all the correct fields
    user.role = 'seller';
    user.isSeller = true; 
    user.sellerApplicationStatus = 'approved';
    // --- END FIX ---
    await user.save();
    res.json({ message: 'User approved as seller' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const rejectSellerApplication = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    // --- FIX ---
    // Set all the correct fields
    user.isSeller = false;
    user.sellerApplicationStatus = 'rejected';
    // --- END FIX ---
    await user.save();
    res.json({ message: 'Seller application rejected' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all users with the role 'seller'
const getSellers = asyncHandler(async (req, res) => {
  const sellers = await User.find({ role: 'seller' }).select('-password');
  res.json(sellers);
});

export {
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  getProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  getOrders,
  updateOrderToDelivered,
  getSellerApplications,
  approveSellerApplication,
  rejectSellerApplication,
  getSellers,
};