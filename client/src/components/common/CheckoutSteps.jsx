import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  return (
    <nav className="flex justify-center items-center my-8">
      <div className="flex items-center space-x-2 text-sm sm:text-base">
        {step1 ? (
          <Link to='/login' className="text-primary font-semibold">Sign In</Link>
        ) : (
          <span className="text-gray-400">Sign In</span>
        )}
        <ChevronRight className="w-4 h-4 text-gray-400" />
        
        {step2 ? (
          <Link to='/shipping' className="text-primary font-semibold">Shipping</Link>
        ) : (
          <span className="text-gray-400">Shipping</span>
        )}
        <ChevronRight className="w-4 h-4 text-gray-400" />

        {step3 ? (
          <Link to='/payment' className="text-primary font-semibold">Payment</Link>
        ) : (
          <span className="text-gray-400">Payment</span>
        )}
        <ChevronRight className="w-4 h-4 text-gray-400" />

        {step4 ? (
          <Link to='/placeorder' className="text-primary font-semibold">Place Order</Link>
        ) : (
          <span className="text-gray-400">Place Order</span>
        )}
      </div>
    </nav>
  );
};

export default CheckoutSteps;