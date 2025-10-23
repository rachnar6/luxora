import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import NotificationToast from '../components/common/NotificationToast';
import CartItem from '../components/cart/CartItem';
import { ShoppingCart, ArrowLeft, ShoppingBag } from 'lucide-react';

const formatCurrency = (value) => {
    // Add safety check for NaN
    if (isNaN(value)) {
        return '₹NaN'; // Or a default like '₹0.00'
    }
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(value);
};

const CartPage = () => {
    const { cartItems, loading, error, updateItemQty, removeItem } = useCart();
    const navigate = useNavigate();
    const [showToast, setShowToast] = React.useState(false);
    const [toastMessage, setToastMessage] = React.useState('');
    const [toastType, setToastType] = React.useState('info');

    const handleUpdateQty = async (productId, qty) => {
        try {
            await updateItemQty(productId, qty);
        } catch (err) {
            setToastMessage(err.message || 'Failed to update cart.');
            setToastType('error');
            setShowToast(true);
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            await removeItem(productId);
            setToastMessage('Item removed from cart.');
            setToastType('info');
            setShowToast(true);
        } catch (err) {
            setToastMessage(err.message || 'Failed to remove item.');
            setToastType('error');
            setShowToast(true);
        }
    };

    const checkoutHandler = () => {
        navigate('/checkout');
    };

    // ✅ THIS IS THE FIX: Access price via item.product.price
    const subtotal = cartItems.reduce((acc, item) => {
        // Add a safety check in case product data is missing
        const price = item?.product?.price || 0;
        return acc + item.qty * price;
    }, 0);
    
    const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-6xl mx-auto my-8 dark:bg-gray-800">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 flex items-center gap-3 dark:text-gray-100">
                <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-primary" /> Shopping Cart
            </h1>

            {error && <div className="text-center text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</div>}

            {cartItems.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Your cart is empty.</p>
                    <Link to="/" className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Go Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {cartItems.map((item) => (
                            // Ensure CartItem is also updated if it displays price directly
                            <CartItem
                                key={item.product._id}
                                item={item}
                                onUpdateQty={handleUpdateQty}
                                onRemoveItem={handleRemoveItem}
                            />
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-gray-50 rounded-xl p-6 sticky top-28 shadow-inner dark:bg-gray-700/50">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b pb-3 dark:border-gray-600">
                                Order Summary
                            </h2>
                            <div className="space-y-3 text-lg mb-6">
                                <div className="flex justify-between font-semibold text-gray-800 dark:text-gray-100">
                                    <span>Subtotal ({totalItems} items)</span>
                                    {/* Subtotal will now display correctly */}
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 pt-2">
                                    Shipping & taxes will be calculated at checkout.
                                </p>
                            </div>
                            <button
                                onClick={checkoutHandler}
                                disabled={cartItems.length === 0}
                                className="w-full mt-6 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold text-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ShoppingBag className="w-5 h-5" /> Proceed to Checkout
                            </button>
                        </div>
                    </div>
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

export default CartPage;