import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import NotificationToast from '../components/common/NotificationToast';
import { Lock } from 'lucide-react';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setToast({ show: true, message: "Passwords do not match.", type: 'error' });
            return;
        }
        setLoading(true);
        try {
            const data = await resetPassword(token, password);
            setToast({ show: true, message: data.message || "Password has been reset successfully. Please log in.", type: 'success' });
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setToast({ show: true, message: error.response?.data?.message || "An error occurred.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-12">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Reset Your Password</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                         <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                         <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400">
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
            {toast.show && (
                <NotificationToast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
            )}
        </div>
    );
};

export default ResetPasswordPage;