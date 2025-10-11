import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import { getDeals } from '../services/productService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Gift, ArrowLeft } from 'lucide-react';

const AllDealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const data = await getDeals();
        setDeals(data);
      } catch (err) {
        setError('Failed to fetch deals. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500 mt-8 text-xl p-4 bg-red-50 rounded-lg">{error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-7xl mx-auto my-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3 mb-4 sm:mb-0">
          <Gift className="w-10 h-10 text-red-500" /> Deals of the Day
        </h1>
        <Link to="/" className="inline-flex items-center text-primary hover:underline font-medium">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
        </Link>
      </div>

      {deals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {deals.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-600 text-xl">No deals are available at the moment. Please check back later!</p>
        </div>
      )}
    </div>
  );
};

export default AllDealsPage;