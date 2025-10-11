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
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col dark:bg-gray-800 dark:border dark:border-gray-700">
        <Link to={`/product/${product._id}`} className="block relative h-48 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/E0E7FF/3B82F6?text=No+Image`; }}
          />
        </Link>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate dark:text-gray-100">
            <Link to={`/product/${product._id}`} className="hover:text-primary transition-colors duration-300">
              {product.name}
            </Link>
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
          <div className="flex justify-between items-center mt-auto pt-2">
            <span className="text-2xl font-bold text-primary">{formatCurrency(product.price)}</span>
            <div className="flex space-x-2">
              <button
                onClick={handleWishlistClick}
                className={`p-2 rounded-full transition-colors duration-300 ${isInWishlist ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-gray-600'}`}
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

