import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart as clearCartAPI } from '../services/cartService';
import { useAuth } from './AuthContext';
import { getUserAddresses, addShippingAddress as saveAddressToDB } from '../services/userService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shippingAddress, setShippingAddress] = useState(null);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState(() => {
        return localStorage.getItem('paymentMethod') || 'Razorpay';
    });

    useEffect(() => {
        const fetchData = async () => {
            if (user && token) {
                setLoading(true);
                setError(null);
                try {
                    const cartPromise = getCart();
                    const addressPromise = getUserAddresses(token);
                    const [cartData, addressesData] = await Promise.all([cartPromise, addressPromise]);
                    const populatedCartItems = cartData.items.filter(item => item && item.product);
                    setCartItems(populatedCartItems);
                    setSavedAddresses(addressesData);
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

    const clearCart = async () => {
    if (!user) return;
    try {
        console.log("3. Calling backend to clear cart..."); // 👈 ADD LOG
        await clearCartAPI();
        console.log("4. Backend cleared cart. Clearing local state."); // 👈 ADD LOG
        setCartItems([]);
    } catch(err) {
        console.error("ERROR: Failed to clear cart on server", err); // 👈 ADD LOG
        setCartItems([]);
    }
};

const buyNowItem = async (productId, qty = 1) => {
    if (!user) {
        throw new Error('Please log in to buy items.');
    }
    try {
        console.log("2. buyNowItem started. About to clear cart."); // 👈 ADD LOG
        await clearCart();
        console.log("5. Cart cleared. About to add single item."); // 👈 ADD LOG
        await addItem(productId, qty);
        console.log("6. Single item added. Buy Now complete."); // 👈 ADD LOG
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to process Buy Now.');
        throw err;
    }
};

    const saveShippingAddress = (data) => {
        localStorage.setItem('shippingAddress', JSON.stringify(data));
        setShippingAddress(data);
    };
    
    const addAddress = async (newAddress) => {
        if (!user || !token) return;
        try {
            const updatedAddresses = await saveAddressToDB(newAddress, token);
            setSavedAddresses(updatedAddresses);
        } catch(err) {
            console.error("Failed to save address to DB", err);
            throw err;
        }
    };

    const savePaymentMethod = (method) => {
        localStorage.setItem('paymentMethod', method);
        setPaymentMethod(method);
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
                buyNowItem, // Export the new function
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