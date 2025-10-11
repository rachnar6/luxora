import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import CheckoutSteps from '../components/common/CheckoutSteps';
import { CreditCard } from 'lucide-react';

const PaymentPage = () => {
  const { shippingAddress, paymentMethod, savePaymentMethod } = useCart();
  const navigate = useNavigate();

  // If the user hasn't entered a shipping address, redirect them back
  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);

  const [paymentOption, setPaymentOption] = useState(paymentMethod || 'PayPal');

  const submitHandler = (e) => {
    e.preventDefault();
    savePaymentMethod(paymentOption);
    navigate('/placeorder');
  };

  return (
    <div className="max-w-md mx-auto">
      <CheckoutSteps step1 step2 step3 />
      <div className="bg-white p-8 rounded-lg shadow-md mt-4">
        <h1 className="text-3xl font-bold mb-6 text-center text-text-dark">Payment Method</h1>
        <form onSubmit={submitHandler}>
          <fieldset className="mb-6">
            <legend className="text-xl font-medium text-gray-800 mb-4">Select Method</legend>
            <div className="space-y-4">
              <div className="flex items-center p-4 border rounded-lg has-[:checked]:bg-blue-50 has-[:checked]:border-primary">
                <input
                  type="radio"
                  id="PayPal"
                  name="paymentMethod"
                  value="PayPal"
                  checked={paymentOption === 'PayPal'}
                  onChange={(e) => setPaymentOption(e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <label htmlFor="PayPal" className="ml-3 block text-lg text-gray-700 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-blue-500" />
                  PayPal or Credit Card
                </label>
              </div>
              {/* You can add more payment options here later */}
            </div>
          </fieldset>
          
          <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;