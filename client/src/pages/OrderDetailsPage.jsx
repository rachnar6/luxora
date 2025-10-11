import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderDetails, getPaypalClientId, updateOrderToPaid } from '../services/orderService';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import LoadingSpinner from '../components/common/LoadingSpinner';
import NotificationToast from '../components/common/NotificationToast';

const OrderDetailsPage = () => {
  const { id: orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrderDetails(orderId);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const addPaypalScript = async () => {
        try {
            const { clientId } = await getPaypalClientId();
            if (clientId) {
                setSdkReady(true);
            }
        } catch (error) {
            console.error("Could not fetch PayPal client ID", error);
        }
    };

    if (!order || !order.isPaid) {
      if (!window.paypal) {
        addPaypalScript();
      } else {
        setSdkReady(true);
      }
    }
  }, [order]);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const onApprove = (data, actions) => {
    return actions.order.capture().then(async (details) => {
      try {
        await updateOrderToPaid(orderId, details);
        fetchOrder(); // Refresh order details
        setToastMessage('Payment Successful!');
        setShowToast(true);
      } catch (err) {
        console.error("Failed to update order status:", err);
      }
    });
  };

  const onError = (err) => {
      setToastMessage('Payment failed. Please try again.');
      setShowToast(true);
      console.error("PayPal Error:", err);
  };
  
  if (loading || !order) return <LoadingSpinner />;
  if (error) return <div className="text-center text-error mt-8">{error}</div>;

  const initialOptions = {
      "client-id": "YOUR_PAYPAL_CLIENT_ID", // Will be replaced below
      currency: "USD", // Change if needed
      intent: "capture",
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto my-8">
        <h1 className="text-3xl font-bold mb-4">Order #{order._id}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-2xl font-semibold mb-2">Shipping</h2>
              <p><strong>Name: </strong>{order.user.name}</p>
              <p><strong>Email: </strong><a href={`mailto:${order.user.email}`} className="text-primary">{order.user.email}</a></p>
              <p><strong>Address: </strong>{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
              {order.isDelivered ? <div className="mt-2 p-2 bg-success/20 text-success rounded-md">Delivered</div> : <div className="mt-2 p-2 bg-error/20 text-error rounded-md">Not Delivered</div>}
            </div>
            <div className="border-b pb-4">
                <h2 className="text-2xl font-semibold mb-2">Payment</h2>
                <p><strong>Method: </strong>{order.paymentMethod}</p>
                {order.isPaid ? <div className="mt-2 p-2 bg-success/20 text-success rounded-md">Paid on {new Date(order.paidAt).toLocaleDateString()}</div> : <div className="mt-2 p-2 bg-error/20 text-error rounded-md">Not Paid</div>}
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Order Items</h2>
              {order.orderItems.map((item) => (
                <div key={item.product} className="flex items-center gap-4 py-2 border-b last:border-b-0">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded"/>
                  <Link to={`/product/${item.product}`} className="flex-grow font-semibold hover:underline">{item.name}</Link>
                  <div>{item.qty} x ${item.price.toFixed(2)} = ${(item.qty * item.price).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
              <h2 className="text-2xl font-bold mb-4 border-b pb-2">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between"><span>Items</span><span>${order.itemsPrice.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>${order.shippingPrice.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>${order.taxPrice.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-xl border-t pt-2 mt-2"><span>Total</span><span>${order.totalPrice.toFixed(2)}</span></div>
              </div>
              {!order.isPaid && (
                <div className="mt-6">
                  {sdkReady ? (
                    <PayPalScriptProvider options={{ 'client-id': process.env.REACT_APP_PAYPAL_CLIENT_ID || 'sb', currency: 'USD' }}>
                      <PayPalButtons
                        style={{ layout: 'vertical' }}
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            purchase_units: [{ amount: { value: order.totalPrice.toFixed(2) } }],
                          });
                        }}
                        onApprove={onApprove}
                        onError={onError}
                      />
                    </PayPalScriptProvider>
                  ) : ( <LoadingSpinner /> )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showToast && <NotificationToast message={toastMessage} type="success" onClose={() => setShowToast(false)} />}
    </>
  );
};

export default OrderDetailsPage;