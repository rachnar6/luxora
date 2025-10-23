import React, { createContext, useState, useContext, useCallback } from 'react';
// Make sure login and register are correctly imported from authService
import { login, register } from '../services/authService'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Initialize user state from localStorage
    const [user, setUserState] = useState(() => { // Renamed setUser to setUserState to avoid conflict
        try {
            const userInfo = localStorage.getItem('userInfo');
            return userInfo ? JSON.parse(userInfo) : null;
        } catch (error) {
            console.error("Failed to parse user info from localStorage", error);
            return null;
        }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- THIS IS THE CORRECTED FUNCTION ---
    // Function to update user state and localStorage with ALL necessary fields
    const updateAuthUser = useCallback((updatedUserInfo) => {
        if (!updatedUserInfo) { // Handle cases where updatedUserInfo might be null/undefined
            localStorage.removeItem('userInfo');
            setUserState(null);
            return;
        }
        
        // Ensure ALL required fields are included
        const userDataToStore = {
            _id: updatedUserInfo._id || user?._id,
            name: updatedUserInfo.name,
            email: updatedUserInfo.email,
            profilePicture: updatedUserInfo.profilePicture,
            isSeller: updatedUserInfo.isSeller,
            isAdmin: updatedUserInfo.isAdmin, // Directly use the value from backend
            sellerApplicationStatus: updatedUserInfo.sellerApplicationStatus, // Add this status
            seller: updatedUserInfo.seller, // <-- ADD THE SELLER OBJECT
            token: updatedUserInfo.token || user?.token
        };

        // Remove undefined keys before storing to avoid issues
        Object.keys(userDataToStore).forEach(key => {
          if (userDataToStore[key] === undefined) {
            delete userDataToStore[key];
          }
        });

        localStorage.setItem('userInfo', JSON.stringify(userDataToStore));
        setUserState(userDataToStore); // Update the React state
    }, [user]); // Dependency remains 'user' (previous state)

    // Login function
    const loginUser = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const data = await login(email, password); // Fetch data from API
            updateAuthUser(data); // Update state and localStorage
            return data;
        } catch (err) {
            const message = err.response?.data?.message || 'Invalid email or password';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    // Register function
    const registerUser = async (name, email, password) => {
        setLoading(true);
        setError(null);
        try {
            const data = await register(name, email, password); // Register via API
            updateAuthUser(data); // Update state and localStorage
            return data;
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logoutUser = () => {
        updateAuthUser(null); // Clear user data using the update function
        // Optionally clear other related localStorage items
        // localStorage.removeItem('shippingAddress');
        // localStorage.removeItem('paymentMethod');
    };

    // Provide context value to children
    return (
        <AuthContext.Provider
            value={{
                user,
                // Expose the update function correctly as 'setUser' for components using the context
                setUser: updateAuthUser, 
                token: user?.token,
                loading,
                error,
                loginUser,
                logoutUser,
                registerUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the Auth context
export const useAuth = () => {
    return useContext(AuthContext);
};