import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { addOrderItems } from '../services/orderService';
import CheckoutSteps from '../components/common/CheckoutSteps';
import NotificationToast from '../components/common/NotificationToast';

const PlaceOrderPage = () => {
  const { cartItems, shippingAddress, paymentMethod, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!paymentMethod) {
      navigate('/payment');
    }
  }, [paymentMethod, navigate]);

  // --- Calculations ---
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = 0.15 * itemsPrice;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const placeOrderHandler = async () => {
    setLoading(true);
    try {
      const orderData = {
        orderItems: cartItems.map(item => ({ ...item, product: item.product._id })),
        shippingAddress,
        paymentMethod,
        itemsPrice: itemsPrice.toFixed(2),
        taxPrice: taxPrice.toFixed(2),
        shippingPrice: shippingPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
      };

      const createdOrder = await addOrderItems(orderData);
      clearCart();
      // We will create the OrderDetailsPage next
      navigate(`/order/${createdOrder._id}`); 
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CheckoutSteps step1 step2 step3 step4 />
      <div className="max-w-4xl mx-auto my-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Shipping</h2>
            <p><strong>Address: </strong>{shippingAddress.address}, {shippingAddress.city}, {shippingAddress.postalCode}, {shippingAddress.country}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
            <p><strong>Method: </strong>{paymentMethod}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Order Items</h2>
            {cartItems.length === 0 ? <p>Your cart is empty.</p> : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.product._id} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                    <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-md"/>
                    <Link to={`/product/${item.product._id}`} className="flex-grow font-semibold text-text-dark hover:text-primary">{item.product.name}</Link>
                    <div className="text-right text-text-dark">
                      <p>{item.qty} x ${item.price.toFixed(2)}</p>
                      <p className="font-bold">${(item.qty * item.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">Order Summary</h2>
            <div className="space-y-2 text-text-dark">
              <div className="flex justify-between"><span>Items</span><span>${itemsPrice.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>${shippingPrice.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax (15%)</span><span>${taxPrice.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-xl border-t pt-2 mt-2"><span>Total</span><span>${totalPrice.toFixed(2)}</span></div>
            </div>
            <button
              type="button"
              className="w-full bg-primary text-white py-3 mt-6 rounded-lg font-semibold hover:bg-primary-dark transition disabled:bg-gray-400"
              disabled={cartItems.length === 0 || loading}
              onClick={placeOrderHandler}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
      {showToast && <NotificationToast message={error} type="error" onClose={() => setShowToast(false)} />}
    </>
  );
};

export default PlaceOrderPage;