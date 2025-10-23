import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMySales, updateOrderStatus } from '../../services/orderService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NotificationToast from '../../components/common/NotificationToast';
import { ShoppingBag, MapPin, Truck, CheckCircle, XCircle, RefreshCcw, RotateCcw, AlertTriangle } from 'lucide-react';

// Currency formatter
const formatCurrency = (value) => {
    const numericValue = Number(value);
    if (isNaN(numericValue)) return '₹0.00';
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numericValue);
};

// Date formatter
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    });
};

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const MySalesPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, token } = useAuth();

    const [updatingStatusOrderId, setUpdatingStatusOrderId] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    // Fetch sales data
    const fetchSales = useCallback(async () => {
        setError(null);
        try {
            if (!token) throw new Error("Authentication token not found.");
            if (!user?._id) throw new Error("User ID not available from authentication context.");
            const data = await getMySales(token);
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Failed to fetch sales data.');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [token, user?._id]);

    useEffect(() => {
        setLoading(true);
        if (user?._id && token) {
            fetchSales();
        } else {
            setLoading(false);
            const reason = !user?._id ? "User not identified (_id missing)" : "Auth token missing";
            setError(`${reason}. Cannot fetch sales.`);
        }
    }, [fetchSales, user?._id, token]);

    // Status update handler
    const handleStatusUpdate = async (orderId, newStatus) => {
        if (typeof newStatus !== 'string' || !ORDER_STATUSES.includes(newStatus)) {
            setToast({ show: true, message: `Invalid status selected.`, type: 'error' });
            return;
        }
        setUpdatingStatusOrderId(orderId);
        setToast({ show: false, message: '', type: 'info' });
        try {
            if (!token) throw new Error("Authentication token not found.");
            await updateOrderStatus(orderId, newStatus, token);
            setToast({ show: true, message: `Order status updated to ${newStatus}`, type: 'success' });
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order._id === orderId ? { ...order, orderStatus: newStatus } : order
                )
            );
        } catch (err) {
            setToast({ show: true, message: err.response?.data?.message || 'Failed to update status', type: 'error' });
            setOrders(prevOrders => [...prevOrders]);
        } finally {
            setUpdatingStatusOrderId(null);
        }
    };

    // Spinner on first load
    if (loading && orders.length === 0 && !error) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 dark:text-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                    <ShoppingBag className="mr-3 text-primary dark:text-primary-light" size={32} />
                    My Sales
                </h1>
                <button
                    onClick={() => { setLoading(true); fetchSales(); }}
                    disabled={loading}
                    className="flex items-center gap-2 text-sm font-semibold text-primary dark:text-primary-light hover:underline disabled:opacity-50"
                >
                    <RefreshCcw size={16} className={loading ? 'animate-spin' : ''}/> Refresh Orders
                </button>
            </div>
            {/* Error */}
            {error && !loading && (
                <div className="text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-4 rounded mb-6">{error}</div>
            )}
            {/* Orders List */}
            <div className="space-y-8">
                {!loading && orders.length === 0 && !error ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-10 italic">You have no sales yet.</p>
                ) : (
                    orders.map(order => {
                        const sellerItems = order.orderItems?.filter(item => {
                            const productSellerId = item?.product?.user?._id?.toString();
                            const loggedInSellerId = user?._id?.toString();
                            return productSellerId && loggedInSellerId && productSellerId === loggedInSellerId;
                        }) || [];

                        const sellerItemsTotal = sellerItems.reduce((acc, item) => {
                            const qty = Number(item.qty) || 0;
                            const price = Number(item.price) || 0;
                            return acc + (qty * price);
                        }, 0);

                        if (sellerItems.length === 0) return null;

                        return (
                            <div key={order._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border dark:border-gray-700">
                                {/* Order Header */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 flex flex-wrap justify-between items-center gap-4 border-b dark:border-gray-700">
                                    <div>
                                        <p className="font-semibold text-sm text-gray-700 dark:text-gray-200">
                                            Order ID: <span className="font-mono text-xs text-gray-500 dark:text-gray-400">#{order.orderNumber || order._id}</span>
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Date: <span className="font-medium">{formatDate(order.createdAt)}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Order Total:</p>
                                        <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{formatCurrency(order.totalPrice)}</p>
                                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">Your Items Value: {formatCurrency(sellerItemsTotal)}</p>
                                    </div>
                                </div>
                                {/* Order Body */}
                                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1 space-y-3">
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-200 border-b pb-1 mb-2 dark:border-gray-600">Customer</h4>
                                        <p className="text-sm">
                                            <span className="font-medium">{order.user?.name || 'N/A'}</span> <br/>
                                            <span className="text-gray-500 dark:text-gray-400 break-all">{order.user?.email || 'No email'}</span>
                                        </p>
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-200 border-b pb-1 mb-2 mt-4 dark:border-gray-600">Shipping Address</h4>
                                        {order.shippingAddress ? (
                                            <address className="text-sm not-italic text-gray-600 dark:text-gray-300">
                                                {order.shippingAddress.name && <>{order.shippingAddress.name}<br/></>}
                                                {order.shippingAddress.address}<br/>
                                                {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br/>
                                                {order.shippingAddress.country}
                                            </address>
                                        ) : ( <p className="text-sm text-gray-500 dark:text-gray-400 italic">No shipping address provided.</p> )}
                                    </div>
                                    {/* Seller Items List */}
                                    <div className="md:col-span-2 space-y-3">
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-200 border-b pb-1 mb-2 dark:border-gray-600">Your Items in this Order</h4>
                                        <ul className="space-y-3">
                                            {sellerItems.map(item => (
                                                <li key={item.product?._id || item._id} className="flex items-start gap-3 border-b pb-3 last:border-b-0 dark:border-gray-700">
                                                    <img
                                                        src={item.image || '/images/placeholder.png'}
                                                        alt={item.product?.name || 'Product Image'}
                                                        className="w-12 h-12 object-cover rounded flex-shrink-0 bg-gray-200 dark:bg-gray-600"
                                                        onError={(e) => { e.target.onerror = null; e.target.src='/images/placeholder.png';}}
                                                    />
                                                    <div className="flex-grow text-sm">
                                                        <p className="font-medium text-gray-800 dark:text-gray-100 line-clamp-1" title={item.product?.name || ''}>{item.product?.name || 'Product Name Missing'}</p>
                                                        <p className="text-gray-500 dark:text-gray-400">Qty: {item.qty} @ {formatCurrency(item.price)}</p>
                                                        {/* --- Show Return Info --- */}
                                                        {item.returnStatus && item.returnStatus !== 'None' && (
                                                            <div className={`mt-2 p-2 rounded text-xs border ${
                                                                item.returnStatus === 'Requested' ? 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:border-yellow-800 dark:text-yellow-300' :
                                                                item.returnStatus === 'Approved' ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/50 dark:border-blue-800 dark:text-blue-300' :
                                                                item.returnStatus === 'Rejected' ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/50 dark:border-red-800 dark:text-red-300' :
                                                                'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                                                            }`}>
                                                                <p className="font-semibold flex items-center gap-1">
                                                                    {item.returnStatus === 'Requested' && <AlertTriangle size={14}/>}
                                                                    {item.returnStatus === 'Approved' && <RotateCcw size={14}/>}
                                                                    Return {item.returnStatus}
                                                                </p>
                                                                {item.returnReason && <p className="mt-1 italic">Reason: {item.returnReason}</p>}
                                                                {item.returnRequestedAt && <p className="mt-1 text-gray-500 dark:text-gray-400">Requested: {formatDate(item.returnRequestedAt)}</p>}
                                                            </div>
                                                        )}
                                                        {/* --- End Return Info --- */}
                                                    </div>
                                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 flex-shrink-0">{formatCurrency(item.qty * item.price)}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                {/* Order Footer: Status & Update */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 border-t dark:border-gray-700 flex flex-wrap justify-between items-center gap-4">
                                    <div>
                                        <span className="text-sm font-medium mr-2 dark:text-gray-300">Current Status:</span>
                                        <span className={`status-badge status-${order.orderStatus?.toLowerCase() || 'unknown'}`}>{order.orderStatus || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label htmlFor={`status-${order._id}`} className="sr-only">Update Status</label>
                                        <select
                                            id={`status-${order._id}`}
                                            value={order.orderStatus || ''}
                                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                            disabled={updatingStatusOrderId === order._id}
                                            className="text-sm border rounded-md p-1.5 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100 focus:ring-primary focus:border-primary"
                                        >
                                            {ORDER_STATUSES.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                        {updatingStatusOrderId === order._id && <LoadingSpinner size="xs" />}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            {/* Toast Notifications */}
            {toast.show && <NotificationToast message={toast.message} type={toast.type} onClose={() => setToast({ show: false })} />}
        </div>
    );
};

export default MySalesPage;
