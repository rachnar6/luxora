import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
// Assuming getOrders is in your adminService or orderService
import { getOrders, deliverOrder } from '../../services/adminService'; 
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Search, Package, CheckCircle, XCircle } from 'lucide-react';

const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(value);
};

const OrderListPage = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [keyword, setKeyword] = useState(''); // State for the search input

    useEffect(() => {
        const fetchOrders = async () => {
            if (user && user.role === 'admin') {
                setLoading(true);
                try {
                    // Pass the keyword to the service function
                    const data = await getOrders(token, keyword);
                    setOrders(data);
                } catch (err) {
                    setError('Failed to fetch orders.');
                } finally {
                    setLoading(false);
                }
            } else {
                navigate('/login');
            }
        };

        // Debounce search to prevent API calls on every keystroke
        const searchTimeout = setTimeout(() => {
            fetchOrders();
        }, 300); // 300ms delay

        return () => clearTimeout(searchTimeout);

    }, [user, token, navigate, keyword]); // Re-fetch when keyword changes
    
    const deliverHandler = async (id) => {
        if (window.confirm('Mark this order as delivered?')) {
            try {
                await deliverOrder(id, token);
                // Refresh the list by re-fetching
                const data = await getOrders(token, keyword);
                setOrders(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to update order');
            }
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-7xl mx-auto my-8 dark:bg-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                    <Package className="w-8 h-8 text-primary" /> All Orders
                </h1>
                
                {/* --- SEARCH BAR --- */}
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by user or product..."
                        className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>
            </div>

            {loading ? <LoadingSpinner /> : error ? (
                <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">ID</th>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">USER</th>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">DATE</th>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">TOTAL</th>
                                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">PAID</th>
                                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">DELIVERED</th>
                                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400 font-mono">{order._id.substring(20, 24)}</td>
                                    <td className="py-4 px-4 text-sm text-gray-800 dark:text-gray-100">{order.user?.name || 'Deleted User'}</td>
                                    <td className="py-4 px-4 text-sm text-gray-800 dark:text-gray-300">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(order.totalPrice)}</td>
                                    <td className="py-4 px-4 text-center">
                                        {order.isPaid ? (
                                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        {order.isDelivered ? (
                                           <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <div className="flex justify-center items-center space-x-2">
                                            <Link to={`/order/${order._id}`} className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 text-xs font-semibold">Details</Link>
                                            
                                            {!order.isDelivered && (
                                                <button
                                                    onClick={() => deliverHandler(order._id)}
                                                    className="p-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900"
                                                    title="Mark as Delivered"
                                                >
                                                    <Package className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OrderListPage;

