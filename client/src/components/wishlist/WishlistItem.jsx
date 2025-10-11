
import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import NotificationToast from '../common/NotificationToast';

const WishlistItem = ({ item }) => {
  const { removeItemFromWishlist, error: wishlistError } = useWishlist();
  const { addItem: addItemToCart, error: cartError } = useCart();
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastType, setToastType] = React.useState('info');

  // --- Add this check here ---
  if (!item || !item.product) {
    console.warn("WishlistItem received an invalid item or product:", item);
    return null; // Don't render if item or product is undefined
  }
  // --- End of check ---

  const handleRemoveFromWishlist = async () => {
    try {
      await removeItemFromWishlist(item.product._id);
      setToastMessage(`${item.product.name} removed from wishlist.`);
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage(wishlistError || 'Failed to remove from wishlist.');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addItemToCart(item.product._id, 1);
      setToastMessage(`${item.product.name} added to cart!`);
      setToastType('success');
      setShowToast(true);
      // Optionally remove from wishlist after adding to cart
      await removeItemFromWishlist(item.product._id);
    } catch (error) {
      setToastMessage(cartError || 'Failed to add to cart.');
      setToastType('error');
      setShowToast(true);
    }
  };

  return (
    <div className="flex items-center bg-white rounded-lg shadow-md p-4 mb-4 transition-all duration-300 hover:shadow-lg">
      <Link to={`/product/${item.product._id}`} className="w-24 h-24 flex-shrink-0 mr-4">
        <img
          src={item.product.image}
          alt={item.product.name}
          className="w-full h-full object-cover rounded-md"
          onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/100x100/E0E7FF/3B82F6?text=No+Image`; }}
        />
      </Link>
      <div className="flex-grow">
        <Link to={`/product/${item.product._id}`} className="text-lg font-semibold text-gray-800 hover:text-primary transition-colors duration-300">
          {item.product.name}
        </Link>
        <p className="text-gray-600">${item.product.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center space-x-2 ml-4">
        <button
          onClick={handleAddToCart}
          className="p-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          title="Add to Cart"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
        <button
          onClick={handleRemoveFromWishlist}
          className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          title="Remove from Wishlist"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>
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

export default WishlistItem;