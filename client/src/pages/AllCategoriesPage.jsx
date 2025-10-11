// client/src/pages/AllCategoriesPage.jsx
// Displays a list of all available product categories

import React, { useEffect, useState } from 'react'; // Import useEffect and useState
import { Link } from 'react-router-dom';
import { ArrowLeft, List } from 'lucide-react';
import { getUniqueCategories } from '../services/productService'; // Import getUniqueCategories
import LoadingSpinner from '../components/common/LoadingSpinner';
import NotificationToast from '../components/common/NotificationToast';

const AllCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUniqueCategories();
        setCategories(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching all categories:", err.response ? err.response.data : err.message);
        setError(err.response?.data?.message || 'Failed to fetch categories');
        setToastMessage(err.response?.data?.message || 'Failed to fetch categories.');
        setToastType('error');
        setShowToast(true);
        setLoading(false);
      }
    };
    fetchCategories();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto my-8">
      <Link to="/" className="inline-flex items-center text-primary hover:text-primary-dark mb-6 font-medium">
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
      </Link>

      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center flex items-center justify-center gap-3">
        <List className="w-8 h-8 text-primary" /> All Categories
      </h1>

      {error && !showToast ? (
        <div className="text-center text-red-500 text-xl mt-8">{error}</div>
      ) : categories.length === 0 ? (
        <div className="text-center text-gray-600 text-xl mt-8">No categories found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/?category=${cat}`} // Link back to homepage with category filter applied
              className="bg-gray-50 rounded-xl shadow-md p-4 text-center hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center"
            >
              <img
                src={`https://placehold.co/100x100/F0F8FF/4682B4?text=${cat.replace(/\s/g, '+')}`}
                alt={cat}
                className="mx-auto mb-3 rounded-full"
              />
              <p className="font-semibold text-gray-800 text-lg">{cat}</p>
            </Link>
          ))}
        </div>
      )}
      {showToast && (
        <NotificationToast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default AllCategoriesPage;
