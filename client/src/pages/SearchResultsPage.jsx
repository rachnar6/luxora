import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import { getProducts } from '../services/productService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Search, ArrowLeft } from 'lucide-react';

const SearchResultsPage = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  const keyword = searchParams.get('keyword');

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (keyword) {
        try {
          setLoading(true);
          const filters = { searchTerm: keyword };
          const data = await getProducts(filters);
          setSearchResults(data);
        } catch (err) {
          setError('Failed to fetch search results.');
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
        setLoading(false);
      }
    };
    fetchSearchResults();
  }, [keyword]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-error mt-8">{error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-7xl mx-auto my-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
          <Search className="w-10 h-10 text-primary" /> 
          Search Results for: <span className="text-primary">{keyword}</span>
        </h1>
      </div>

      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {searchResults.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-600 text-xl">No products found for "{keyword}".</p>
          <Link to="/" className="inline-flex items-center text-primary hover:underline font-medium mt-4">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
          </Link>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;