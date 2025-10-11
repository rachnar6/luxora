import React from 'react';

const FaqsPage = () => {
  const faqs = [
    { q: 'How do I track my order?', a: 'Once your order has shipped, you will receive an email with a tracking number and a link to track your package.' },
    { q: 'What is your return policy?', a: 'We offer a 30-day return policy for unused items in their original packaging. Please visit our Returns & Orders page for more details.' },
    { q: 'How do I change my shipping address?', a: 'You can change your shipping address in the "My Account" section before your order has been shipped.' },
    { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, as well as PayPal.' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto my-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Frequently Asked Questions (FAQs)</h1>
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index}>
            <h2 className="text-xl font-bold text-gray-800 mb-2">{faq.q}</h2>
            <p className="text-gray-600">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaqsPage;