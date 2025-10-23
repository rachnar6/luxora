import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import NotificationToast from '../common/NotificationToast';
import AddToWishlistModal from '../wishlist/AddToWishlistModal';

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

const ProductCard = ({ product }) => {
  const { addItem: addItemToCart } = useCart();
  const { wishlists } = useWishlist();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastType, setToastType] = React.useState('info');

  if (!product) {
    return null;
  }

  // ✅ NEW: Calculate discount percentage if originalPrice exists
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const isInWishlist = wishlists.some(list => 
    list.items.some(item => item.product?._id === product._id)
  );

  const productInWishlists = wishlists
    .filter(list => list.items.some(item => item.product?._id === product._id))
    .map(list => list._id);

  const handleAddToCart = async () => {
    try {
      await addItemToCart(product._id, 1);
      setToastMessage(`${product.name} added to cart!`);
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage(error.response?.data?.message || 'Failed to add to cart.');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleWishlistClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col dark:bg-gray-800 border border-transparent dark:border-gray-700">
        
        {/* Image container */}
        <Link to={`/product/${product._id}`} className="block relative h-48 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/E0E7FF/3B82F6?text=No+Image`; }}
          />
          {/* ✅ NEW: Discount badge */}
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
              {discount}% OFF
            </div>
          )}
        </Link>
        
        {/* Content container */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Category/Brand */}
          <p className="text-sm text-gray-500 mb-1 dark:text-gray-400">{product.category || product.brand}</p>
          
          {/* Product Name */}
          <h3 className="text-lg font-semibold text-gray-800 mb-3 truncate dark:text-gray-100">
            <Link to={`/product/${product._id}`} className="hover:text-primary transition-colors duration-300">
              {product.name}
            </Link>
          </h3>
          
          {/* Price and Action Buttons */}
          <div className="mt-auto pt-3 flex items-end justify-between">
            {/* ✅ NEW: Price with optional original price */}
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(product.price)}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">{formatCurrency(product.originalPrice)}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleWishlistClick}
                className={`p-2 rounded-full transition-colors duration-300 ${isInWishlist ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                title="Add to Wishlist"
              >
                <Heart className="w-5 h-5" fill={isInWishlist ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleAddToCart}
                className="p-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors duration-300"
                title="Add to Cart"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <AddToWishlistModal 
          product={product} 
          onClose={() => setIsModalOpen(false)} 
          productInWishlists={productInWishlists}
        />
      )}
      
      {showToast && (
        <NotificationToast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
};

export default ProductCard;