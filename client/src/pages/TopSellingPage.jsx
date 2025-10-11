// client/src/pages/TopSellingPage.jsx
// Displays the top selling products

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { getTopSellingProducts } from '../services/productService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProductCard from '../components/products/ProductCard';
import NotificationToast from '../components/common/NotificationToast';

const TopSellingPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTopSellingProducts();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching top selling products:", err.response ? err.response.data : err.message);
        setError(err.response?.data?.message || 'Failed to fetch top selling products');
        setToastMessage(err.response?.data?.message || 'Failed to fetch top selling products.');
        setToastType('error');
        setShowToast(true);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-6xl mx-auto my-8">
      <Link to="/" className="inline-flex items-center text-primary hover:text-primary-dark mb-6 font-medium">
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
      </Link>

      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center flex items-center justify-center gap-3">
        <TrendingUp className="w-8 h-8 text-green-500" /> Top Selling Products
      </h1>

      {error && !showToast ? (
        <div className="text-center text-red-500 text-xl mt-8">{error}</div>
      ) : products.length === 0 ? (
        <p className="text-gray-600 text-center text-xl">No top selling products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
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

export default TopSellingPage;
