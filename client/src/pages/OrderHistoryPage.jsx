import React, { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getMyOrders } from '../services/orderService';
import { Link } from 'react-router-dom';
import Loader from '../components/common/LoadingSpinner';
import Message from '../components/common/NotificationToast';

// Helper to format currency
const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(value);
};

const OrderHistoryPage = () => {
    // ✅ 1. Get the 'token' from the useAuth hook
    const { user, token } = useAuth(); 
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // This check is now more robust with the token
        if (!user || !token) {
            setError('Please log in to view your orders.');
            setLoading(false);
            return;
        }

        const fetchOrders = async () => {
            try {
                // ✅ 2. Pass the 'token' to the getMyOrders function
                const data = await getMyOrders(token); 
                setOrders(data);
            } catch (err) {
                setError('Failed to fetch orders. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, token]); // ✅ 3. Add 'token' to the dependency array

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-5xl mx-auto my-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 flex items-center justify-center gap-3">
                <History className="w-8 h-8 text-primary" /> My Orders
            </h1>
            
            {loading ? (
                <Loader />
            ) : error ? (
                <Message type="error">{error}</Message>
            ) : orders.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-xl text-gray-600">You have no orders yet.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-300">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                                <h2 className="text-xl font-semibold text-gray-800">Order #{order._id.substring(18)}</h2>
                                <p className="text-sm text-gray-500">
                                    Placed on: {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                                <Link to={`/order/${order._id}`} className="text-primary hover:underline font-semibold">
                                    View Details
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-700 border-t pt-4">
                                <div>
                                    <span className="font-medium text-gray-500 block">Total Price</span>
                                    <span className="font-bold text-lg">{formatCurrency(order.totalPrice)}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-500 block">Paid</span>
                                    <span className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                                        {order.isPaid ? `Yes, on ${new Date(order.paidAt).toLocaleDateString()}` : 'No'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-500 block">Delivered</span>
                                     <span className={`font-semibold ${order.isDelivered ? 'text-green-600' : 'text-gray-600'}`}>
                                        {order.isDelivered ? `Yes, on ${new Date(order.deliveredAt).toLocaleDateString()}` : 'Not yet'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;