import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import session from 'express-session';
import passport from 'passport';
import './config/passport.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import Wishlist from './models/wishlistModel.js';


connectDB();

const app = express();

// Create HTTP server and integrate Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection logic
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinWishlist', (wishlistId) => {
        socket.join(wishlistId);
        console.log(`User ${socket.id} joined room ${wishlistId}`);
    });

    socket.on('sendMessage', (data) => {
        // Broadcast the message to everyone in the specific wishlist room
        io.to(data.wishlistId).emit('receiveMessage', data.message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Middleware
app.use(express.json());
app.use(cors());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'a_default_secret_for_development',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chatbot', chatbotRoutes);


// Root route for testing
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// IMPORTANT: Use server.listen, not app.listen, to start the server
server.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));