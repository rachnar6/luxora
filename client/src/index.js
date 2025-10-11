import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ProductProvider } from './contexts/ProductContext';
import { ThemeProvider } from './contexts/ThemeContext';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <ThemeProvider>
        <AuthProvider>
        <CartProvider>
          <WishlistProvider> {/* 2. ADD the WishlistProvider wrapper */}
            <ProductProvider>
              <App />
            </ProductProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
      </ThemeProvider>
    </Router>
  </React.StrictMode>
);