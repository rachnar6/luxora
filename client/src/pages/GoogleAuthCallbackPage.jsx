import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import LoadingSpinner from '../components/common/LoadingSpinner';

const GoogleAuthCallbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      try {
        // 1. Decode the token to get the user's details
        const decodedUserData = jwtDecode(token);

        // 2. Create the full userInfo object, including the token itself
        const userInfo = {
          ...decodedUserData,
          token: token,
        };

        // 3. Save the COMPLETE object to localStorage
        localStorage.setItem('userInfo', JSON.stringify(userInfo));

        // 4. Redirect to the homepage. The AuthContext will now load the correct data.
        window.location.href = '/';

      } catch (error) {
        console.error("Failed to decode token:", error);
        navigate('/login');
      }
    } else {
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