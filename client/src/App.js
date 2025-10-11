import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Chatbot from './components/common/Chatbot';

// --- Page Imports ---
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import AllDealsPage from './pages/AllDealsPage'; 
import RegisterPage from './pages/RegisterPage';
import WishlistPage from './pages/WishlistPage';
import SharedWishlistPage from './pages/SharedWishlistPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import CheckoutPage from './pages/CheckoutPage';
import SearchResultsPage from './pages/SearchResultsPage';
import AccountPage from './pages/AccountPage';
import TopSellingPage from './pages/TopSellingPage';
import LatestProductsPage from './pages/LatestProductsPage';
import ReturnsOrdersPage from './pages/ReturnsOrdersPage';
import CustomerServicePage from './pages/CustomerServicePage';
import FaqsPage from './pages/FaqsPage';
import ContactUsPage from './pages/ContactUsPage';
import PaymentPage from './pages/PaymentPage';
import ShippingPage from './pages/ShippingPage';
import PlaceOrderPage from './pages/PlaceholderPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import GoogleAuthCallbackPage from './pages/GoogleAuthCallbackPage';
import WishlistDetailPage from './pages/WishlistDetailPage';

// --- Route Protection ---
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import SellerRoute from './components/common/SellerRoute';

// --- Admin Page Imports ---
import UserListPage from './pages/admin/UserListPage';
import ProductListPage from './pages/admin/ProductListPage';
import OrderListPage from './pages/admin/OrderListPage';
import ProductEditPage from './pages/admin/ProductEditPage';
import UserEditPage from './pages/admin/UserEditPage';
import SellerListPage from './pages/admin/SellerListPage';
import ProductsBySellerPage from './pages/admin/ProductsBySellerPage';
import SellerApplicationsPage from './pages/admin/SellerApplicationsPage';

// --- Seller Page Imports ---
import MyProductsPage from './pages/seller/MyProductsPage'; 
import ProductCreatePage from './pages/seller/ProductCreatePage'; 
import MySalesPage from './pages/seller/MySalesPage';

function App() {
  return (
      <div className="flex flex-col min-h-screen bg-gray-100 font-inter dark:bg-gray-900">

      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/deals" element={<AllDealsPage />} />
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
                      
          {/* --- Private User Routes --- */}
          <Route path="" element={<PrivateRoute />}>
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/wishlist/:id" element={<WishlistDetailPage />} /> 
            <Route path="/orders" element={<OrderHistoryPage />} />
            <Route path="/profile" element={<AccountPage />} />
          </Route>
          
          {/* --- Seller Routes --- */}
          <Route path="/seller" element={<SellerRoute />}>
            <Route path="productlist" element={<MyProductsPage />} />
            <Route path="product/:id/edit" element={<ProductEditPage />} />
            <Route path="product/create" element={<ProductCreatePage />} />
            <Route path="orders" element={<MySalesPage />} />
          </Route>

          {/* --- Admin Routes --- */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route path="userlist" element={<UserListPage />} />
            <Route path="user/:id/edit" element={<UserEditPage />} />
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
      <Chatbot />
    </div>
  );
}

export default App;