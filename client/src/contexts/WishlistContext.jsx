import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import {
    getMyWishlists,
    createWishlist,
    addItemToWishlist,
    removeItemFromWishlist,
    deleteWishlist,
} from '../services/wishlistService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [wishlists, setWishlists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWishlists = useCallback(async () => {
        if (user && token) {
            setLoading(true);
            try {
                const data = await getMyWishlists(token);
                setWishlists(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch wishlists');
            } finally {
                setLoading(false);
            }
        } else {
            setWishlists([]);
        }
    }, [user, token]);

    useEffect(() => {
        fetchWishlists();
    }, [fetchWishlists]);

    // ✅ THE FIX: This function now correctly accepts 'validUntil' and passes it to the service.
    const createNewWishlist = async (name, validUntil) => {
        if (!user || !token) return;
        try {
            // It now passes all three arguments to the service function.
            const newWishlist = await createWishlist(name, validUntil, token);
            setWishlists(currentWishlists => [newWishlist, ...currentWishlists]);
            return newWishlist;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create wishlist');
            throw err;
        }
    };

    const addItem = async (wishlistId, productId) => {
        if (!user || !token) return;
        try {
            const updatedWishlist = await addItemToWishlist(wishlistId, productId, token);
            setWishlists(currentWishlists =>
                currentWishlists.map(w => w._id === wishlistId ? updatedWishlist : w)
            );
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add item');
            throw err;
        }
    };
    
    const removeItem = async (wishlistId, itemId) => {
        if (!user || !token) return;
        try {
            await removeItemFromWishlist(wishlistId, itemId, token);
            fetchWishlists(); // Refetch to get the latest state
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove item');
            throw err;
        }
    };

    const removeWishlist = async (wishlistId) => {
        if (!user || !token) return;
        try {
            await deleteWishlist(wishlistId, token);
            setWishlists(currentWishlists => currentWishlists.filter(w => w._id !== wishlistId));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete wishlist');
            throw err;
        }
    };

    return (
        <WishlistContext.Provider 
            value={{ 
                wishlists, 
                loading, 
                error, 
                createNewWishlist, 
                addItem, 
                removeItem, 
                removeWishlist,
                fetchWishlists
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    return useContext(WishlistContext);
};

