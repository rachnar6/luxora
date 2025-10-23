import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// Import the new function
import { getProfile } from '../services/authService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const GoogleAuthCallbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // This function will use the token to get fresh user data
    const fetchUserProfile = async (token) => {
      try {
        // 1. Use the token to fetch the full, up-to-date user profile
        const userProfileData = await getProfile(token);

        // 2. Create the final userInfo object to store
        // This will have the correct 'isSeller: true'
        const userInfo = {
          ...userProfileData,
          token: token,
        };

        // 3. Save the COMPLETE, CORRECT object to localStorage
        localStorage.setItem('userInfo', JSON.stringify(userInfo));

        // 4. Redirect. AuthContext will pick up the new data on reload.
        window.location.href = '/';

      } catch (error) {
        console.error("Failed to fetch profile with token:", error);
        navigate('/login');
      }
    };

    // Get the token from the URL
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      // If token exists, fetch the profile
      fetchUserProfile(token);
    } else {
      // If no token, just go to login
      navigate('/login');
    }
  }, [location, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-lg text-gray-600">Finalizing login, please wait...</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallbackPage;