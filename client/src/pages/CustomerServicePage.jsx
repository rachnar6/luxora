import React from 'react';
import { Mail, Phone, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerServicePage = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto my-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Customer Service</h1>
      <p className="text-lg text-gray-600 mb-8">
        We're here to help! If you have any questions about your order, our products, or our website, please don't hesitate to get in touch.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact by Email */}
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Email Us</h2>
          <p className="text-gray-600 mb-4">Get in touch by email for less urgent questions.</p>
          <a href="mailto:support@luxora.com" className="font-semibold text-primary hover:underline">
            support@luxora.com
          </a>
        </div>

        {/* Contact by Phone */}
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Call Us</h2>
          <p className="text-gray-600 mb-4">Speak to a member of our team directly.</p>
          <a href="tel:+911234567890" className="font-semibold text-primary hover:underline">
            +91 123 456 7890
          </a>
        </div>

        {/* FAQs */}
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">FAQs</h2>
          <p className="text-gray-600 mb-4">Find answers to our most frequently asked questions.</p>
          <Link to="/faqs" className="font-semibold text-primary hover:underline">
            View FAQs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerServicePage;