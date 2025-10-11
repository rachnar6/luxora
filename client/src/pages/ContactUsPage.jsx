import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // We can use axios directly for this simple public route
import NotificationToast from '../components/common/NotificationToast';
import { Send, User, Mail } from 'lucide-react';

const ContactUsPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/contact', { name, email, message });
      setToastMessage(data.message);
      setToastType('success');
      setShowToast(true);
      // Clear form
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      setToastMessage(error.response?.data?.message || 'Failed to send message.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto my-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">Contact Us</h1>
        <p className="text-lg text-gray-600 mb-8 text-center">
          Have a question or feedback? Fill out the form below to get in touch with our team.
        </p>

        <form onSubmit={submitHandler}>
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block font-medium mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block font-medium mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block font-medium mb-1">Message</label>
              <textarea
                id="message"
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="How can we help you?"
              ></textarea>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white py-3 mt-8 rounded-lg font-semibold hover:bg-primary-dark transition flex items-center justify-center gap-2 disabled:bg-gray-400"
          >
            {loading ? 'Sending...' : <><Send className="w-5 h-5" /> Send Message</>}
          </button>
        </form>
      </div>

      {showToast && (
        <NotificationToast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
};

export default ContactUsPage;