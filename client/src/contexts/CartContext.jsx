import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCart, addToCart, updateCartItem, removeFromCart } from '../services/cartService';
import { useAuth } from './AuthContext';
// ✅ 1. Import the new functions from userService
import { getUserAddresses, addShippingAddress as saveAddressToDB } from '../services/userService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth(); // Get the token for API calls
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- UPDATED ADDRESS MANAGEMENT (Now fetches from DB) ---
  const [shippingAddress, setShippingAddress] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState(() => {
    return localStorage.getItem('paymentMethod') || 'Razorpay';
  });

  // ✅ 2. This useEffect now fetches BOTH cart items and saved addresses
  useEffect(() => {
    const fetchData = async () => {
      if (user && token) {
        setLoading(true);
        setError(null);
        try {
          // Fetch cart in parallel with addresses
          const cartPromise = getCart();
          const addressPromise = getUserAddresses(token);

          const [cartData, addressesData] = await Promise.all([cartPromise, addressPromise]);

          // Set cart items
          const populatedCartItems = cartData.items.filter(item => item && item.product);
          setCartItems(populatedCartItems);

          // Set saved addresses
          setSavedAddresses(addressesData);

          // Set the current shipping address. Use the last one saved, or the first in the list.
          const currentShippingAddress = localStorage.getItem('shippingAddress');
          if (currentShippingAddress) {
              setShippingAddress(JSON.parse(currentShippingAddress));
          } else if (addressesData.length > 0) {
              setShippingAddress(addressesData[0]);
          }

        } catch (err) {
          console.error("Failed to fetch user data:", err);
          setError(err.response?.data?.message || 'Failed to fetch your cart and addresses.');
        } finally {
          setLoading(false);
        }
      } else {
        // Clear all data on logout
        setCartItems([]);
        setSavedAddresses([]);
        setShippingAddress(null);
        setLoading(false);
      }
    };
    fetchData();
  }, [user, token]);

  const addItem = async (productId, qty = 1) => {
    if (!user) {
      setError('Please log in to add items to cart.');
      throw new Error('Please log in to add items to cart.');
    }
    try {
      const data = await addToCart(productId, qty);
      const populatedItems = data.items.filter(item => item && item.product);
      setCartItems(populatedItems);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item to cart');
      throw err;
    }
  };

  const updateItemQty = async (productId, qty) => {
    if (!user) return;
    try {
      const data = await updateCartItem(productId, qty);
      const populatedItems = data.items.filter(item => item && item.product);
      setCartItems(populatedItems);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item quantity');
      throw err;
    }
  };

  const removeItem = async (productId) => {
    if (!user) return;
    try {
      const data = await removeFromCart(productId);
      const populatedItems = data.items.filter(item => item && item.product);
      setCartItems(populatedItems);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item from cart');
      throw err;
    }
  };

  // ✅ 3. This function now only saves the SELECTED address for the current session
  const saveShippingAddress = (data) => {
    localStorage.setItem('shippingAddress', JSON.stringify(data));
    setShippingAddress(data);
  };
  
  // ✅ 4. This function now saves a NEW address to the DATABASE
  const addAddress = async (newAddress) => {
    if (!user || !token) return;
    try {
        const updatedAddresses = await saveAddressToDB(newAddress, token);
        setSavedAddresses(updatedAddresses);
    } catch(err) {
        console.error("Failed to save address to DB", err);
        // Optionally show an error toast to the user here
        throw err;
    }
  };

  const savePaymentMethod = (method) => {
    localStorage.setItem('paymentMethod', method);
    setPaymentMethod(method);
  };

  const clearCart = () => {
    // We don't clear addresses when an order is placed, only cart items
    setCartItems([]);
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        loading, 
        error, 
        addItem, 
        updateItemQty, 
        removeItem, 
        clearCart,
        shippingAddress,
        savedAddresses,
        addAddress,
        paymentMethod,
        saveShippingAddress,
        savePaymentMethod 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};

