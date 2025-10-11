import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMySales } from '../../services/orderService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ShoppingBag } from 'lucide-react';

const MySalesPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, token } = useAuth(); // Get the logged-in user

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const data = await getMySales(token);
                setOrders(data);
            } catch (err) {
                setError('Failed to fetch sales data.');
            } finally {
                setLoading(false);
            }
        };
        if (token) {
            fetchSales();
        }
    }, [token]);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center mb-6">
                <ShoppingBag className="mr-3 text-primary" size={32} />
                My Sales
            </h1>
            <div className="space-y-6">
                {orders.length > 0 ? (
                    orders.map(order => (
                        <div key={order._id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center border-b pb-2 mb-2">
                                <div>
                                    <p className="font-bold">Order ID: <span className="font-normal text-gray-600">{order._id}</span></p>
                                    <p className="font-bold">Customer: <span className="font-normal text-gray-600">{order.user.name} ({order.user.email})</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">Date: <span className="font-normal text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</span></p>
                                    <p className="font-bold text-lg">${order.totalPrice.toFixed(2)}</p>
                                </div>
                            </div>
                            <h4 className="font-semibold mt-4 mb-2">Items you sold in this order:</h4>
                            <ul className="list-disc pl-5">
                                {order.orderItems
                                    // Filter to show ONLY the items that belong to the logged-in seller
                                    .filter(item => user && item.product && item.product.user && item.product.user.toString() === user.id)
                                    .map(item => (
                                    <li key={item._id} className="text-gray-700">
                                        {item.qty} x {item.product.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">You have no sales yet.</p>
                )}
            </div>
        </div>
    );
};

export default MySalesPage; 