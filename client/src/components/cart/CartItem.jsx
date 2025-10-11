import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';

const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(value);
};

const CartItem = ({ item, onUpdateQty, onRemoveItem }) => {
    // Safety check in case product data is missing from the cart item
    if (!item || !item.product) {
        console.error("CartItem received an invalid item:", item);
        return null;
    }

    const { _id, name, image, price, countInStock } = item.product;

    const handleDecrement = () => {
        if (item.qty > 1) {
            onUpdateQty(_id, item.qty - 1);
        }
    };

    const handleIncrement = () => {
        if (item.qty < countInStock) {
            onUpdateQty(_id, item.qty + 1);
        }
    };

    return (
        <div className="flex items-center gap-4 sm:gap-6 border-b py-6 last:border-b-0 dark:border-gray-700">
            <Link to={`/product/${_id}`} className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover rounded-md border dark:border-gray-700"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/100x100/E0E7FF/3B82F6?text=No+Image`; }}
                />
            </Link>
            <div className="flex-grow">
                <Link to={`/product/${_id}`} className="font-semibold text-lg text-gray-800 hover:text-primary dark:text-gray-100 dark:hover:text-primary">
                    {name}
                </Link>
                <p className="text-gray-600 mt-1 dark:text-gray-400">{formatCurrency(item.price)}</p>
                {countInStock > 0 && countInStock < 10 && (
                    <p className="text-sm font-semibold text-red-500 mt-2">
                        Only {countInStock} left in stock - order soon!
                    </p>
                )}
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
                {countInStock > 0 ? (
                    <div className="flex items-center border rounded-lg dark:border-gray-600">
                        <button 
                            onClick={handleDecrement} 
                            disabled={item.qty <= 1}
                            className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="px-3 font-semibold text-lg text-gray-800 dark:text-gray-100">{item.qty}</span>
                        <button 
                            onClick={handleIncrement}
                            disabled={item.qty >= countInStock}
                            className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                ) : (
                    <span className="text-sm text-red-500 font-semibold">Out of Stock</span>
                )}
                <button
                    onClick={() => onRemoveItem(_id)}
                    className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                    title="Remove Item"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default CartItem;

