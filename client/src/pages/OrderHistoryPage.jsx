import React, { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Import the custom hook
import { getMyOrders } from '../services/orderService';
import { Link } from 'react-router-dom';
import Loader from '../components/common/LoadingSpinner';
import Message from '../components/common/NotificationToast';

const OrderHistoryPage = () => {
  const { user } = useAuth(); // Use the custom hook to access the user object
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setError('Please log in to view your orders.');
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await getMyOrders(); // Your orderService needs to pass the token
        setOrders(data);
      } catch (err) {
        setError('Failed to fetch orders. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

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
        <Message type="info">You have no orders yet.</Message>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Order #{order._id.substring(0, 10)}...</h2>
                <Link to={`/order/${order._id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                  View Details
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 text-gray-700">
                <div className="flex flex-col">
                  <span className="font-medium">Total Price:</span>
                  <span>${order.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Status:</span>
                  <span>{order.isPaid ? 'Paid' : 'Not Paid'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Ordered On:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="mt-4 border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-2">Order Items</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {order.orderItems.map((item) => (
                    <li key={item.product}>
                      {item.name} ({item.qty}) - ${item.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;