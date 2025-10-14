import React, { useState } from 'react';
import { forgotPassword } from '../services/authService';
import NotificationToast from '../components/common/NotificationToast';
import { Mail } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await forgotPassword(email);
            setToast({ show: true, message: data.message || "If an account with that email exists, a reset link has been sent.", type: 'success' });
        } catch (error) {
            setToast({ show: true, message: error.response?.data?.message || "An error occurred.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-12">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Forgot Password</h1>
                <p className="text-center text-gray-600 mb-8">Enter your email address and we'll send you a link to reset your password.</p>
                <form onSubmit={handleSubmit}>
                    <div className="relative mb-6">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="email"
                            placeholder="Your Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400">
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
            </div>
            {toast.show && (
                <NotificationToast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
            )}
        </div>
    );
};

export default ForgotPasswordPage;