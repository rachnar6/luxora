import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';

const formatCurrency = (value) => {
    // Add safety check
    const numericValue = Number(value);
    if (isNaN(numericValue)) {
        console.warn("formatCurrency received NaN, returning default."); // Add a warning
        return '₹0.00'; // Return a default value
    }
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(numericValue);
};

const CartItem = ({ item, onUpdateQty, onRemoveItem }) => {
    // Safety check for item and nested product
    if (!item || !item.product) {
        console.error("CartItem received an invalid item:", item);
        // Optionally render a placeholder or error message
        return <div className="text-red-500 py-6">Error loading item data.</div>;
    }

    // Destructure product details from item.product
    const { _id, name, image, price, countInStock } = item.product;

    const handleDecrement = () => {
        if (item.qty > 1) {
            onUpdateQty(_id, item.qty - 1);
        }
    };

    const handleIncrement = () => {
        // Prevent incrementing beyond available stock
        if (item.qty < countInStock) {
            onUpdateQty(_id, item.qty + 1);
        }
    };

    return (
        <div className="flex items-center gap-4 sm:gap-6 border-b py-6 last:border-b-0 dark:border-gray-700">
            {/* Product Image Link */}
            <Link to={`/product/${_id}`} className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 block"> {/* Added block */}
                <img
                    src={image || `https://placehold.co/100x100/E0E7FF/3B82F6?text=No+Image`} // Add fallback directly
                    alt={name || 'Product Image'} // Add fallback alt text
                    className="w-full h-full object-cover rounded-md border dark:border-gray-700"
                    // Simplified onError
                    onError={(e) => { e.target.src = `https://placehold.co/100x100/E0E7FF/3B82F6?text=Error`; }}
                />
            </Link>

            {/* Product Details */}
            <div className="flex-grow">
                <Link 
                  to={`/product/${_id}`} 
                  className="font-semibold text-lg text-gray-800 hover:text-primary dark:text-gray-100 dark:hover:text-primary line-clamp-2" // Added line-clamp
                  title={name} // Add title attribute for long names
                >
                    {name || 'Unknown Product'} {/* Add fallback name */}
                </Link>
                {/* --- THIS IS THE FIX --- */}
                <p className="text-gray-600 mt-1 dark:text-gray-400">{formatCurrency(price)}</p>
                {/* --- END FIX --- */}
                
                {/* Low Stock Warning */}
                {countInStock > 0 && countInStock < 10 && (
                    <p className="text-xs sm:text-sm font-semibold text-red-500 mt-2">
                        Only {countInStock} left in stock - order soon!
                    </p>
                )}
                {/* Out of Stock (if still needed after backend fix) */}
                {countInStock <= 0 && (
                     <p className="text-sm font-semibold text-red-500 mt-2">
                         Out of Stock
                     </p>
                )}
            </div>

            {/* Quantity Controls & Remove Button */}
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 sm:gap-4">
                {/* Only show quantity controls if item is in stock */}
                {countInStock > 0 ? (
                    <div className="flex items-center border rounded-lg dark:border-gray-600">
                        <button
                            onClick={handleDecrement}
                            disabled={item.qty <= 1}
                            className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 dark:hover:bg-gray-700"
                            aria-label="Decrease quantity" // Accessibility
                        >
                            <Minus size={16} />
                        </button>
                        <span className="px-3 font-semibold text-lg text-gray-800 dark:text-gray-100 tabular-nums">{item.qty}</span> {/* Ensure number alignment */}
                        <button
                            onClick={handleIncrement}
                            disabled={item.qty >= countInStock}
                            className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 dark:hover:bg-gray-700"
                            aria-label="Increase quantity" // Accessibility
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                ) : (
                    // Display quantity text if out of stock but still in cart
                    <span className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.qty}</span> 
                )}
                {/* Remove Button */}
                <button
                    onClick={() => onRemoveItem(_id)}
                    className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                    title="Remove Item"
                    aria-label="Remove item from cart" // Accessibility
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default CartItem;