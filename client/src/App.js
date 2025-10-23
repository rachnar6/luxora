import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Chatbot from './components/common/Chatbot';

// --- Core Page Imports ---
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchResultsPage from './pages/SearchResultsPage';
import AccountPage from './pages/AccountPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import GoogleAuthCallbackPage from './pages/GoogleAuthCallbackPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// --- Specific Public Pages ---
import AllDealsPage from './pages/AllDealsPage';
import AllCategoriesPage from './pages/AllCategoriesPage';
import TopSellingPage from './pages/TopSellingPage';
import LatestProductsPage from './pages/LatestProductsPage';
import ReturnsOrdersPage from './pages/ReturnsOrdersPage';
import CustomerServicePage from './pages/CustomerServicePage';
import FaqsPage from './pages/FaqsPage';
import ContactUsPage from './pages/ContactUsPage';
import PaymentPage from './pages/PaymentPage';
import ShippingPage from './pages/ShippingPage';
import PlaceOrderPage from './pages/PlaceholderPage'; // Placeholder for the final order page
import SellerStorePage from './pages/SellerStorePage';
import AllProductsPage from './pages/AllProductsPage'; // <-- Correctly imported

// --- Wishlist/Order Pages (Private) ---
import WishlistPage from './pages/WishlistPage';
import SharedWishlistPage from './pages/SharedWishlistPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import WishlistDetailPage from './pages/WishlistDetailPage';

// --- Seller Pages ---
import SellerProfilePage from './pages/seller/SellerProfilePage';
import MyProductsPage from './pages/seller/MyProductsPage';
import ProductCreatePage from './pages/seller/ProductCreatePage';
import MySalesPage from './pages/seller/MySalesPage';

// --- Route Protection ---
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import SellerRoute from './components/common/SellerRoute';

// --- Admin Page Imports ---
import UserListPage from './pages/admin/UserListPage';
import ProductListPage from './pages/admin/ProductListPage'; // Keep for admin route
import OrderListPage from './pages/admin/OrderListPage';
import ProductEditPage from './pages/admin/ProductEditPage';
import UserEditPage from './pages/admin/UserEditPage';
import SellerListPage from './pages/admin/SellerListPage';
import ProductsBySellerPage from './pages/admin/ProductsBySellerPage';
import SellerApplicationsPage from './pages/admin/SellerApplicationsPage';

// --- Wishlist Chat Import ---
import ChatBox from './components/wishlist/ChatBox';

// Helper component for rendering Wishlist ChatBox conditionally
const ChatRenderer = () => {
    const location = useLocation();
    const match = location.pathname.match(/^\/wishlist\/(.+)/);
    const wishlistId = match ? match[1] : null;
    return wishlistId ? <ChatBox wishlistId={wishlistId} /> : null;
};

function App() {
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const openChatbot = () => setIsChatbotOpen(true);
    const closeChatbot = () => setIsChatbotOpen(false);

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
            <Header openChatbot={openChatbot} />

            <main className="flex-grow container mx-auto px-4 py-8">
                <Routes>
                    {/* --- Public Routes --- */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* ✅ FIX: All Products 'See All' link (URL: /products) */}
                    {/* 👇👇👇 THIS LINE IS NOW CORRECTED 👇👇👇 */}
                    <Route path="/products" element={<AllProductsPage />} />

                    <Route path="/categories" element={<AllCategoriesPage />} />
                    <Route path="/deals" element={<AllDealsPage />} />
                    <Route path="/search" element={<SearchResultsPage />} />
                    <Route path="/top-selling" element={<TopSellingPage />} />
                    <Route path="/latest" element={<LatestProductsPage />} />
                    <Route path="/returns-&-orders" element={<ReturnsOrdersPage />} />
                    <Route path="/customer-service" element={<CustomerServicePage />} />
                    <Route path="/faqs" element={<FaqsPage />} />
                    <Route path="/contact-us" element={<ContactUsPage />} />
                    <Route path="/shipping" element={<ShippingPage />} />
                    <Route path="/payment" element={<PaymentPage />} />
                    <Route path="/placeorder" element={<PlaceOrderPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order/:id" element={<OrderDetailsPage />} />
                    <Route path="/login/success" element={<GoogleAuthCallbackPage />} />
                    <Route path="/shared-wishlist/:id" element={<SharedWishlistPage />} />
                    <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
                    <Route path="/resetpassword/:token" element={<ResetPasswordPage />} />
                    <Route path="/profile/:id" element={<AccountPage />} />
                    <Route path="/seller/:id" element={<SellerStorePage />} />

                    {/* --- Private User Routes --- */}
                    <Route path="" element={<PrivateRoute />}>
                        <Route path="/wishlist" element={<WishlistPage />} />
                        <Route path="/wishlist/:id" element={<WishlistDetailPage />} />
                        <Route path="/orders" element={<OrderHistoryPage />} />
                        {/* Note: Duplicated /order/:id route; PrivateRoute likely handles auth */}
                        <Route path="/order/:id" element={<OrderDetailsPage />} />
                        <Route path="/profile" element={<AccountPage />} />
                        {/* Note: Duplicated /checkout route */}
                        <Route path="/checkout" element={<CheckoutPage />} />
                    </Route>

                    {/* --- Seller Routes --- */}
                    <Route path="/seller" element={<SellerRoute />}>
                        <Route path="productlist" element={<MyProductsPage />} />
                         {/* Make sure ProductEditPage used here is the correct one if there are multiple */}
                        <Route path="product/:id/edit" element={<ProductEditPage />} />
                        <Route path="product/create" element={<ProductCreatePage />} />
                        <Route path="orders" element={<MySalesPage />} />
                        <Route path="profile" element={<SellerProfilePage />} />
                    </Route>

                    {/* --- Admin Routes --- */}
                    <Route path="/admin" element={<AdminRoute />}>
                        <Route path="userlist" element={<UserListPage />} />
                        <Route path="user/:id/edit" element={<UserEditPage />} />
                        {/* This uses the ADMIN ProductListPage */}
                        <Route path="productlist" element={<ProductListPage />} />
                        <Route path="product/:id/edit" element={<ProductEditPage />} />
                        <Route path="orderlist" element={<OrderListPage />} />
                        <Route path="sellerlist" element={<SellerListPage />} />
                        <Route path="seller/:id/products" element={<ProductsBySellerPage />} />
                        <Route path="seller-applications" element={<SellerApplicationsPage />} />
                    </Route>
                </Routes>
            </main>

            <Footer />

            <Chatbot isOpen={isChatbotOpen} onClose={closeChatbot} />
            <ChatRenderer />
        </div>
    );
}

export default App;