import React from 'react';
import { Link } from 'react-router-dom';

const ReturnsOrdersPage = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto my-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Returns & Orders</h1>
      <div className="space-y-6 text-lg text-gray-700">
        <p>
          We want you to be completely satisfied with your purchase. If you're not happy with your order for any reason, you can return it within 30 days of receipt for a full refund or exchange.
        </p>
        <h2 className="text-2xl font-bold pt-4">How to Initiate a Return</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Log in to your account and go to the <Link to="/orders" className="text-primary underline">My Orders</Link> page.</li>
          <li>Find the order you wish to return and click the "Return Items" button.</li>
          <li>Follow the on-screen instructions to complete your return request.</li>
        </ol>
        <h2 className="text-2xl font-bold pt-4">Conditions</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Items must be in their original, unused condition.</li>
          <li>All original tags and packaging must be included.</li>
          <li>Refunds will be processed to the original payment method within 5-7 business days of us receiving the returned item.</li>
        </ul>
      </div>
    </div>
  );
};

export default ReturnsOrdersPage;