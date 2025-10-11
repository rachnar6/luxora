import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import NotificationToast from '../components/common/NotificationToast';
import { LogIn, Mail, Lock, Chrome } from 'lucide-react'; // Added Chrome icon for Google

// ADDED: Google Login Button Component
const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    // This redirects the browser to our backend's Google authentication route.
    // Ensure your server is running on port 5000.
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <button
      onClick={handleGoogleLogin}
      type="button" // Important: type="button" prevents form submission
      className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <Chrome className="w-5 h-5 mr-3 text-red-500" />
      Sign in with Google
    </button>
  );
};


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user, loading, error, loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (user) {
      // CHANGED: Use user.role instead of user.isAdmin
      if (user.role === 'admin') {
        navigate('/admin/userlist');
      } else {
        navigate(redirect);
      }
    }
  }, [user, navigate, redirect]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const loggedInUser = await loginUser(email, password);
      
      setToastMessage('Logged in successfully!');
      setToastType('success');
      setShowToast(true);
      
      // CHANGED: Use loggedInUser.role instead of loggedInUser.isAdmin
      if (loggedInUser.role === 'admin') {
        navigate('/admin/userlist');
      } else {
        navigate(redirect);
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8 flex items-center justify-center gap-3">
          <LogIn className="w-8 h-8 text-primary" /> Sign In
        </h1>

        <form onSubmit={submitHandler} className="space-y-6">
          {/* Email and Password fields remain the same */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="email" id="email" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="password" id="password" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary-dark transition-colors" disabled={loading}>
            {loading ? <LoadingSpinner /> : 'Sign In'}
          </button>
        </form>
        
        {/* ADDED: Divider and Google Login Button */}
        <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
        </div>
        <GoogleLoginButton />

        <div className="mt-6 text-center text-gray-600">
          New Customer?{' '}
          <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} className="text-primary hover:underline font-medium">
            Register
          </Link>
        </div>
      </div>
      {showToast && (
        <NotificationToast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
};

export default LoginPage;