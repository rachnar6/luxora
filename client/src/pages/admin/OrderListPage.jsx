import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getOrders, updateOrderStatus } from '../../services/adminService'; 
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NotificationToast from '../../components/common/NotificationToast';
import { Search, Package } from 'lucide-react';

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
    const [keyword, setKeyword] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    const fetchOrders = async (currentKeyword) => {
        // --- THIS IS THE FIX ---
        // Changed 'user.role === admin' to 'user.isAdmin'
        if (user && user.isAdmin) {
            setLoading(true);
            try {
                const data = await getOrders(token, currentKeyword);
                setOrders(data);
            } catch (err) {
                setError('Failed to fetch orders.');
            } finally {
                setLoading(false);
            }
        } else {
            // This else block should only run if the user is not an admin
            navigate('/login');
        }
    };

    useEffect(() => {
        const searchTimeout = setTimeout(() => {
            fetchOrders(keyword);
        }, 300);

        return () => clearTimeout(searchTimeout);
    }, [user, token, navigate, keyword]);

    // ✅ 2. A more generic handler for any status change
    const handleStatusChange = async (orderId, newStatus) => {
        if (window.confirm(`Update order status to "${newStatus}"?`)) {
            try {
                await updateOrderStatus(orderId, newStatus, token);
                setToast({ show: true, message: `Order updated to ${newStatus}`, type: 'success' });
                // Refresh the list to show the change immediately
                fetchOrders(keyword);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to update order');
            }
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-7xl mx-auto my-8 dark:bg-gray-800">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                        <Package className="w-8 h-8 text-primary" /> All Orders
                    </h1>
                    
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by user or product..."
                            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg"
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
                                    <th className="py-3 px-4 text-left">ID</th>
                                    <th className="py-3 px-4 text-left">USER</th>
                                    <th className="py-3 px-4 text-left">DATE</th>
                                    <th className="py-3 px-4 text-left">TOTAL</th>
                                    <th className="py-3 px-4 text-left">PAID</th>
                                    <th className="py-3 px-4 text-left">CURRENT STATUS</th>
                                    <th className="py-3 px-4 text-left">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="py-4 px-4 font-mono text-sm">{order._id.substring(18)}</td>
                                        <td className="py-4 px-4">{order.user?.name || 'Deleted User'}</td>
                                        <td className="py-4 px-4">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                                        <td className="py-4 px-4 font-semibold">{formatCurrency(order.totalPrice)}</td>
                                        <td className="py-4 px-4">{order.isPaid ? 'Yes' : 'No'}</td>
                                        
                                        {/* ✅ 3. Replaced the simple "Delivered" column with the status dropdown */}
                                        <td className="py-4 px-4">
                                            <select 
                                                value={order.trackingHistory[0]?.status || 'Processing'}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                className="p-2 border rounded-md bg-white dark:bg-gray-600 dark:border-gray-500"
                                            >
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Out for Delivery">Out for Delivery</option>
                                                <option value="Delivered">Delivered</option>
                                            </select>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Link to={`/order/${order._id}`} className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 text-xs font-semibold">
                                                Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {toast.show && <NotificationToast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
        </>
    );
};

export default OrderListPage;