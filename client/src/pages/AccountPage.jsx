import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../services/authService'; // Assuming deleteProfile is also here
import { getMyOrders } from '../services/orderService';
import { applyToBeSeller } from '../services/userService';
import NotificationToast from '../components/common/NotificationToast';
import { User, Mail, Lock, Edit, Trash2, ShoppingBag, Briefcase, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AccountPage = () => {
    const { user, setUser, logoutUser, token } = useAuth();
    const navigate = useNavigate();

    // State for the active tab
    const [activeTab, setActiveTab] = useState('profile');

    // State for profile form
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // State for orders
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    // State for edit mode and notifications
    const [editMode, setEditMode] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('info');

    // State for seller application
    const [sellerStatus, setSellerStatus] = useState(user?.seller?.status || 'Not Applied');
    const [sellerLoading, setSellerLoading] = useState(false);
    const [sellerError, setSellerError] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setSellerStatus(user.seller?.status || 'Not Applied');
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'orders') {
            const fetchOrders = async () => {
                setLoadingOrders(true);
                try {
                    const data = await getMyOrders();
                    setOrders(data);
                } catch (error) {
                    console.error("Failed to fetch orders:", error);
                } finally {
                    setLoadingOrders(false);
                }
            };
            fetchOrders();
        }
    }, [activeTab]);

    const profileUpdateHandler = async (e) => {
        e.preventDefault();
        if (password && password !== confirmPassword) {
            setToastMessage('Passwords do not match');
            setToastType('error');
            setShowToast(true);
            return;
        }
        try {
            const updatedUser = await updateProfile({ name, email, password });
            setUser(updatedUser);
            setToastMessage('Profile updated successfully!');
            setToastType('success');
            setShowToast(true);
            setPassword('');
            setConfirmPassword('');
            setEditMode(false);
        } catch (error) {
            setToastMessage(error.response?.data?.message || 'Failed to update profile.');
            setToastType('error');
            setShowToast(true);
        }
    };

    const deleteAccountHandler = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                // Assuming deleteProfile is a function in authService
                // await deleteProfile(); 
                logoutUser();
                navigate('/register');
            } catch (error) {
                setToastMessage(error.response?.data?.message || 'Failed to delete account.');
                setToastType('error');
                setShowToast(true);
            }
        }
    };
    
    const handleCancelEdit = () => {
        setName(user.name);
        setEmail(user.email);
        setPassword('');
        setConfirmPassword('');
        setEditMode(false);
    };

    const handleApplySeller = async () => {
        setSellerLoading(true);
        setSellerError('');
        try {
            const data = await applyToBeSeller(token);
            setSellerStatus('Pending');
            setToastMessage(data.message || 'Application submitted!');
            setToastType('success');
            setShowToast(true);
        } catch (err) {
            const message = err.response?.data?.message || 'An error occurred.';
            setSellerError(message);
        } finally {
            setSellerLoading(false);
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto my-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8">My Account</h1>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('profile')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Profile
                        </button>
                        <button onClick={() => setActiveTab('orders')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${activeTab === 'orders' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            My Orders
                        </button>
                        {user && user.role === 'user' && (
                            <button onClick={() => setActiveTab('seller')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${activeTab === 'seller' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                Become a Seller
                            </button>
                        )}
                    </nav>
                </div>

                {/* Profile Tab Content */}
                {activeTab === 'profile' && (
                    <div className="animate-fade-in-down">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-text-dark">Profile Information</h2>
                            {!editMode && (
                                <button onClick={() => setEditMode(true)} className="inline-flex items-center px-4 py-2 bg-gray-100 text-text-dark rounded-lg font-semibold hover:bg-gray-200 transition">
                                    <Edit className="w-4 h-4 mr-2" /> Edit Profile
                                </button>
                            )}
                        </div>
                        
                        {editMode ? (
                            <form onSubmit={profileUpdateHandler} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block font-medium mb-1">Name</label>
                                    <div className="relative mt-1">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"/>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="email" className="block font-medium mb-1">Email</label>
                                    <div className="relative mt-1">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"/>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="password" className="block font-medium mb-1">New Password</label>
                                    <div className="relative mt-1">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input type="password" id="password" placeholder="Leave blank to keep the same" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"/>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className="block font-medium mb-1">Confirm New Password</label>
                                    <div className="relative mt-1">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input type="password" id="confirmPassword" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"/>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 pt-4">
                                    <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition">
                                        Save Changes
                                    </button>
                                    <button type="button" onClick={handleCancelEdit} className="flex-1 bg-gray-200 text-text-dark py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500">Full Name</h3>
                                    <p className="text-lg">{user?.name}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500">Email Address</h3>
                                    <p className="text-lg">{user?.email}</p>
                                </div>
                            </div>
                        )}
                        
                        <div className="border-t mt-12 pt-6">
                            <button onClick={deleteAccountHandler} className="inline-flex items-center px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete My Account
                            </button>
                        </div>
                    </div>
                )}

                {/* Orders Tab Content */}
                {activeTab === 'orders' && (
                     <div className="animate-fade-in-down">
                        <h2 className="text-2xl font-bold text-text-dark mb-6">Order History</h2>
                        {loadingOrders ? <LoadingSpinner /> : orders.length === 0 ? (
                            <p>You have not placed any orders yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order._id} className="border rounded-lg p-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold">Order ID: <span className="font-normal text-gray-600">{order._id}</span></p>
                                            <p className="font-bold">Date: <span className="font-normal text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">${order.totalPrice.toFixed(2)}</p>
                                            {order.isDelivered ? <span className="text-sm text-green-600 font-semibold">Delivered</span> : <span className="text-sm text-yellow-600 font-semibold">Processing</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {/* Seller Tab Content */}
                {activeTab === 'seller' && (
                    <div className="animate-fade-in-down">
                        <h2 className="text-2xl font-bold text-text-dark mb-6 flex items-center">
                            <Briefcase className="w-6 h-6 mr-3 text-primary" />
                            Seller Application
                        </h2>
                        {sellerStatus === 'Not Applied' && (
                            <div>
                                <p className="mb-4 text-gray-600">Interested in reaching thousands of customers? Apply to become a seller on LUXORA and start growing your business today.</p>
                                <button onClick={handleApplySeller} disabled={sellerLoading} className="inline-flex items-center px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition disabled:opacity-50">
                                    {sellerLoading ? <LoadingSpinner size="sm" /> : 'Apply Now'}
                                </button>
                                {sellerError && <p className="text-red-500 mt-4">{sellerError}</p>}
                            </div>
                        )}
                        {sellerStatus === 'Pending' && (
                             <div className="flex items-center p-4 bg-yellow-50 text-yellow-700 rounded-lg">
                                <Clock className="w-6 h-6 mr-3" />
                                <span>Your application is currently pending review. We'll notify you via email once a decision is made.</span>
                            </div>
                        )}
                         {sellerStatus === 'Approved' && (
                             <div className="flex items-center p-4 bg-green-50 text-green-700 rounded-lg">
                                <CheckCircle className="w-6 h-6 mr-3" />
                                <span>Congratulations! Your application has been approved. You now have seller privileges.</span>
                            </div>
                        )}
                        {sellerStatus === 'Rejected' && (
                             <div className="flex items-center p-4 bg-red-50 text-red-700 rounded-lg">
                                <XCircle className="w-6 h-6 mr-3" />
                                <span>We regret to inform you that your application was not approved at this time. Please contact support for more information.</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {showToast && (
                <NotificationToast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
            )}
        </>
    );
};

export default AccountPage;