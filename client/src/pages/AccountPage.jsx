// src/pages/AccountPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, deleteProfile } from '../services/authService';
import { getMyOrders } from '../services/orderService';
import { applyToBeSeller } from '../services/userService';
import NotificationToast from '../components/common/NotificationToast';
import { User, Mail, Lock, Edit, Trash2, Briefcase, Clock, CheckCircle, XCircle, Camera, Instagram, Facebook, Twitter, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmationModal from '../components/common/ConfirmationModal';

// Helper to format currency
const formatCurrency = (value) => {
    const numericValue = Number(value);
    if (isNaN(numericValue)) return '₹0.00';
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    }).format(numericValue);
};

// Helper to format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
};

const AccountPage = () => {
    const { user, setUser, logoutUser, token, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Helper to determine initial tab (FIXED LOGIC for better user experience)
    const getInitialTab = useCallback(() => {
        if (!user) return 'profile';
        if (user.isSeller) return 'seller-dashboard';
        // If not a seller, default to 'profile'. 'Seller Apply' is a manual click option.
        return 'profile'; 
    }, [user]);

    // State Initialization
    const [activeTab, setActiveTab] = useState(getInitialTab);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [profilePictureUrl, setProfilePictureUrl] = useState('/images/default-avatar.png');
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('info');
    const [sellerStatus, setSellerStatus] = useState('Not Applied'); 
    const [sellerLoading, setSellerLoading] = useState(false);
    const [sellerError, setSellerError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    // Effects
    useEffect(() => {
        if (!authLoading) {
            if (user) {
                setName(user.name || '');
                setEmail(user.email || '');
                setProfilePictureUrl(user.profilePicture || '/images/default-avatar.png');

                // --- SELLER STATUS LOGIC ---
                let currentStatus = 'Not Applied'; 
                const appStatus = user.sellerApplicationStatus;

                if (appStatus && ['Pending', 'Approved', 'Rejected'].includes(appStatus)) {
                    currentStatus = appStatus;
                } else if (user.isSeller) {
                    currentStatus = 'Approved';
                }
                setSellerStatus(currentStatus);
                // --- END SELLER STATUS LOGIC ---

                // Only set the initial tab if it's the first time user loads or user is an active seller/admin
                // We keep the logic for initial setting based on role, but remove the continuous check 
                // that was overriding manual clicks.
                setActiveTab(prevTab => {
                    if (prevTab === 'profile' || prevTab === 'seller-dashboard') {
                        // Keep current tab if it's one of these two common defaults
                        return prevTab;
                    }
                    return getInitialTab(); // Use initial logic only if the tab isn't already set.
                });

            } else {
                navigate('/login?redirect=/profile');
            }
        }
    }, [user, authLoading, navigate, getInitialTab]);
    
    // --- IMPORTANT FIX: Removed the continuous check on activeTab vs correctInitialTab inside useEffect
    // --- to prevent the UI from jumping away from the manually selected Profile tab.

    useEffect(() => {
        if (activeTab === 'orders' && token && user && !user.isAdmin) {
            const fetchOrders = async () => {
                setLoadingOrders(true);
                try {
                    const data = await getMyOrders(token);
                    setOrders(data);
                } catch (error) {
                    console.error("Failed to fetch orders:", error);
                    setToastMessage(error.response?.data?.message || 'Failed to fetch orders.');
                    setToastType('error'); setShowToast(true); setOrders([]);
                } finally { setLoadingOrders(false); }
            };
            fetchOrders();
        }
    }, [activeTab, token, user]);

    // Handlers
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { setToastMessage('File size exceeds 2MB limit.'); setToastType('error'); setShowToast(true); return; }
            if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) { setToastMessage('Invalid file type (JPG, PNG, GIF allowed).'); setToastType('error'); setShowToast(true); return; }
            setProfilePictureFile(file); setProfilePictureUrl(URL.createObjectURL(file));
        }
    };

    const profileUpdateHandler = async (e) => {
        e.preventDefault();
        if (password && password !== confirmPassword) { setToastMessage('Passwords do not match'); setToastType('error'); setShowToast(true); return; }
        if (!name.trim() || !email.trim()) { setToastMessage('Name and Email cannot be empty.'); setToastType('error'); setShowToast(true); return; }
        setLoadingUpdate(true);
        const formData = new FormData();
        formData.append('name', name); formData.append('email', email);
        if (password) formData.append('password', password);
        if (profilePictureFile) formData.append('profilePicture', profilePictureFile);
        try {
            const updatedUser = await updateProfile(formData, token);
            setUser(updatedUser); setToastMessage('Profile updated successfully!'); setToastType('success'); setShowToast(true);
            setPassword(''); setConfirmPassword(''); setEditMode(false); setProfilePictureFile(null);
        } catch (error) {
            setToastMessage(error.response?.data?.message || 'Failed to update profile.'); setToastType('error'); setShowToast(true);
        } finally { setLoadingUpdate(false); }
    };

    const deleteAccountHandler = async () => {
        setShowDeleteModal(false); setLoadingDelete(true);
        try {
            await deleteProfile(token); logoutUser();
            navigate('/register', { replace: true, state: { message: 'Account deleted successfully.' } });
        } catch (error) {
            setToastMessage(error.response?.data?.message || 'Failed to delete account.'); setToastType('error'); setShowToast(true);
            setLoadingDelete(false);
        }
    };

    const handleCancelEdit = () => {
        if (user) {
            setName(user.name || ''); setEmail(user.email || '');
            setProfilePictureUrl(user.profilePicture || '/images/default-avatar.png');
        }
        setPassword(''); setConfirmPassword(''); setProfilePictureFile(null); setEditMode(false);
        const fileInput = document.getElementById('profilePictureInput'); if (fileInput) fileInput.value = '';
    };

    const handleApplySeller = async () => {
        setSellerLoading(true); setSellerError('');
        try {
            const data = await applyToBeSeller(token);
            setUser(data.user); // Update user context with new status
            setSellerStatus(data.user.sellerApplicationStatus || 'Pending');
            setToastMessage(data.message || 'Application submitted! Awaiting review.'); setToastType('success'); setShowToast(true);
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to submit application.';
            setSellerError(message); setToastMessage(message); setToastType('error'); setShowToast(true);
        } finally { setSellerLoading(false); }
    };

    // --- Render ---
    if (authLoading) return <LoadingSpinner />;
    if (!user) return <div className="text-center text-red-500 mt-8">Redirecting...</div>;

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto my-8 dark:bg-gray-800">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-8">My Account</h1>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
                    <nav className="-mb-px flex flex-wrap space-x-6 md:space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('profile')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-base md:text-lg transition-colors ${activeTab === 'profile' ? 'border-primary text-primary dark:border-primary-light dark:text-primary-light' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'}`}>Profile</button>
                        {!user?.isAdmin && (<button onClick={() => setActiveTab('orders')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-base md:text-lg transition-colors ${activeTab === 'orders' ? 'border-primary text-primary dark:border-primary-light dark:text-primary-light' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'}`}>My Orders</button>)}
                        {user?.isSeller ? (<button onClick={() => setActiveTab('seller-dashboard')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-base md:text-lg transition-colors ${activeTab === 'seller-dashboard' ? 'border-primary text-primary dark:border-primary-light dark:text-primary-light' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'}`}>Seller Dashboard</button>)
                            : !user?.isAdmin ? (<button onClick={() => setActiveTab('seller-apply')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-base md:text-lg transition-colors ${activeTab === 'seller-apply' ? 'border-primary text-primary dark:border-primary-light dark:text-primary-light' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'}`}>Become a Seller</button>)
                            : null}
                    </nav>
                </div>

                {/* --- Tab Content --- */}
                <div>
                    {/* Profile Tab Content */}
                    {activeTab === 'profile' && (
                        <div className="animate-fade-in-down">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Profile Information</h2>
                                {!editMode && (<button onClick={() => setEditMode(true)} className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition"><Edit className="w-4 h-4 mr-2" /> Edit Profile</button>)}
                            </div>
                            <form onSubmit={profileUpdateHandler} className="space-y-6">
                                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-8">
                                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0"><img src={profilePictureUrl || '/images/default-avatar.png'} alt="Profile" className="w-full h-full object-cover rounded-full border-2 border-gray-300 dark:border-gray-600 shadow-sm" onError={(e) => { e.target.onerror = null; e.target.src='/images/default-avatar.png'; }} />{editMode && ( <label htmlFor="profilePictureInput" className="absolute bottom-0 right-0 bg-primary p-2 rounded-full cursor-pointer hover:bg-primary-dark transition-colors shadow" title="Change photo"><Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" /><input id="profilePictureInput" type="file" accept="image/jpeg, image/png, image/gif" onChange={handleFileChange} className="hidden"/></label> )}</div>
                                    {editMode && ( <div className="flex flex-col items-center sm:items-start gap-1 text-center sm:text-left">{profilePictureFile ? ( <span className="text-sm text-gray-600 dark:text-gray-300 break-all">New file selected: {profilePictureFile.name}</span> ) : profilePictureUrl !== '/images/default-avatar.png' ? ( <span className="text-sm text-gray-600 dark:text-gray-300">Current photo active</span> ) : ( <span className="text-sm text-gray-500 dark:text-gray-400 italic">Default photo</span> )}{profilePictureUrl !== '/images/default-avatar.png' && ( <button type="button" onClick={() => { setProfilePictureFile(null); setProfilePictureUrl('/images/default-avatar.png'); const fileInput = document.getElementById('profilePictureInput'); if (fileInput) fileInput.value = ''; }} className="text-xs text-red-500 hover:underline">Remove Photo</button> )}<p className="text-xs text-gray-400 mt-1">(Max 2MB, JPG/PNG/GIF)</p></div> )}
                                </div>
                                <div> <label htmlFor="name" className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label> <div className="relative mt-1"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" /><input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} readOnly={!editMode} required className={`w-full pl-10 pr-3 py-2 border rounded-lg text-sm ${!editMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed border-gray-200 dark:border-gray-600' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-primary focus:border-primary'}`}/></div></div>
                                <div> <label htmlFor="email" className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label> <div className="relative mt-1"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" /><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} readOnly={!editMode} required className={`w-full pl-10 pr-3 py-2 border rounded-lg text-sm ${!editMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed border-gray-200 dark:border-gray-600' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-primary focus:border-primary'}`}/></div></div>
                                {editMode && ( <><div> <label htmlFor="password" className="block text-sm font-medium mb-1 dark:text-gray-300">New Password</label> <div className="relative mt-1"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" /><input type="password" id="password" placeholder="Leave blank to keep current password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 focus:ring-primary focus:border-primary"/></div></div><div> <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 dark:text-gray-300">Confirm New Password</label> <div className="relative mt-1"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" /><input type="password" id="confirmPassword" placeholder="Confirm new password if changing" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 focus:ring-primary focus:border-primary"/></div></div></> )}
                                {editMode && ( <div className="flex flex-col sm:flex-row items-center gap-4 pt-4"><button type="submit" disabled={loadingUpdate} className="w-full sm:w-auto flex-1 bg-primary text-white py-2.5 px-6 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 flex justify-center items-center gap-2 text-sm">{loadingUpdate ? <LoadingSpinner size="xs"/> : <><Save size={16}/> Save Changes</>}</button><button type="button" onClick={handleCancelEdit} className="w-full sm:w-auto flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-2.5 px-6 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition text-sm">Cancel</button></div> )}
                            </form>
                            {!editMode && !user?.isAdmin && ( <div className="border-t dark:border-gray-700 mt-12 pt-6"><h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Delete Account</h3><p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Permanently delete your account. This action cannot be undone.</p><button onClick={() => setShowDeleteModal(true)} disabled={loadingDelete} className="inline-flex items-center px-5 py-2 bg-red-600 text-white font-semibold rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">{loadingDelete ? <LoadingSpinner size="xs" /> : <><Trash2 className="w-4 h-4 mr-2" /> Delete My Account</>}</button></div> )}
                        </div>
                    )}

                    {/* Orders Tab Content */}
                    {activeTab === 'orders' && !user?.isAdmin && (
                        <div className="animate-fade-in-down">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Order History</h2>
                            {loadingOrders ? <LoadingSpinner /> : orders.length === 0 ? (
                                <p className="text-gray-600 dark:text-gray-300 italic">You have not placed any orders yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map(order => (
                                        <div key={order._id} className="border dark:border-gray-700 rounded-lg p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-shadow dark:hover:bg-gray-700/50">
                                            <div><p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Order <span className="font-mono text-gray-600 dark:text-gray-400">#{order._id.substring(18)}</span></p><p className="text-xs text-gray-500 dark:text-gray-400">Placed on: {formatDate(order.createdAt)}</p></div>
                                            <div className="text-left sm:text-right"><p className="font-bold text-base text-gray-800 dark:text-gray-100">{formatCurrency(order.totalPrice)}</p><span className={`status-badge status-${order.orderStatus?.toLowerCase() || 'unknown'} mt-1 text-xs`}>{order.orderStatus || 'N/A'}</span></div>
                                            <Link to={`/order/${order._id}`} className="text-primary hover:underline font-semibold text-sm self-start sm:self-center whitespace-nowrap dark:text-primary-light dark:hover:text-primary">View Details</Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Seller Dashboard Tab Content */}
                    {activeTab === 'seller-dashboard' && user?.isSeller && (
                        <div className="animate-fade-in-down">
                               <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Seller Dashboard</h2>
                               <div className="mb-8 p-4 md:p-6 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                    <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">{user.seller?.brandName || user.name}'s Storefront</h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{user.seller?.bio || 'No description provided.'}</p>
                                    <div className="flex items-center gap-4 flex-wrap text-sm">{user.seller?.contactEmail && ( <a href={`mailto:${user.seller.contactEmail}`} className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"><Mail size={14} /> Contact</a> )}{user.seller?.socialMedia?.instagram && ( <a href={user.seller.socialMedia.instagram.startsWith('http') ? user.seller.socialMedia.instagram : `https://${user.seller.socialMedia.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-pink-600 hover:underline dark:text-pink-400"> <Instagram size={14} /> Instagram </a> )}{user.seller?.socialMedia?.facebook && ( <a href={user.seller.socialMedia.facebook.startsWith('http') ? user.seller.socialMedia.facebook : `https://${user.seller.socialMedia.facebook}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-700 hover:underline dark:text-blue-500"><Facebook size={14} /> Facebook</a> )}{user.seller?.socialMedia?.twitter && ( <a href={user.seller.socialMedia.twitter.startsWith('http') ? user.seller.socialMedia.twitter : `https://${user.seller.socialMedia.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sky-600 hover:underline dark:text-sky-400"><Twitter size={14} /> Twitter</a> )}</div>
                               </div>
                               <p className="text-gray-600 dark:text-gray-300 mb-4 text-base">Manage your products, view sales, and update your public seller profile.</p>
                               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Link to="/seller/productlist" className="block p-4 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900 font-semibold text-center text-sm transition-colors">Manage My Products</Link>
                                    <Link to="/seller/orders" className="block p-4 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-lg hover:bg-green-200 dark:hover:bg-green-900 font-semibold text-center text-sm transition-colors">View My Sales</Link>
                                    <Link to="/seller/profile" className="block p-4 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900 font-semibold text-center text-sm transition-colors">Edit Seller Profile</Link>
                               </div>
                            </div>
                    )}

                    {/* Seller Application Tab Content */}
                    {activeTab === 'seller-apply' && !user?.isSeller && !user?.isAdmin && (
                        <div className="animate-fade-in-down">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                                <Briefcase className="w-6 h-6 mr-3 text-primary" />
                                Become a Seller
                            </h2>
                            {sellerStatus === 'Not Applied' && ( 
                                <div>
                                    <p className="mb-4 text-gray-600 dark:text-gray-300">Interested in reaching thousands of customers? Apply to become a seller on LUXORA and start growing your business today.</p>
                                    <button onClick={handleApplySeller} disabled={sellerLoading} className="inline-flex items-center px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition disabled:opacity-50">
                                        {sellerLoading ? <LoadingSpinner size="xs" /> : 'Apply Now'}
                                    </button>
                                    {sellerError && <p className="text-red-500 mt-4 text-sm">{sellerError}</p>}
                                </div>
                            )}
                            {sellerStatus === 'Pending' && (
                                <div className="flex items-center p-4 bg-yellow-100 text-yellow-800 rounded-lg dark:bg-yellow-900/50 dark:text-yellow-300 text-sm">
                                    <Clock className="w-5 h-5 mr-3 flex-shrink-0" />
                                    <span>Your application is currently pending review. We'll notify you via email once a decision is made.</span>
                                </div>
                            )}
                            {sellerStatus === 'Approved' && (
                                <div className="flex items-center p-4 bg-green-100 text-green-800 rounded-lg dark:bg-green-900/50 dark:text-green-300 text-sm">
                                    <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                                    <span>Congratulations! Your application was approved. You should now see the Seller Dashboard tab.</span>
                                </div>
                            )}
                            {sellerStatus === 'Rejected' && (
                                <div className="flex items-center p-4 bg-red-100 text-red-800 rounded-lg dark:bg-red-900/50 dark:text-red-300 text-sm">
                                    <XCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                                    <span>Unfortunately, your application was not approved. Please contact support if you have questions.</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div> {/* End Main Content Div */}

            {/* Toast Notifications */}
            {showToast && (
                <NotificationToast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
            )}

            {/* Delete Confirmation Modal */}
             <ConfirmationModal
                 isOpen={showDeleteModal}
                 onClose={() => setShowDeleteModal(false)}
                 onConfirm={deleteAccountHandler}
                 title="Confirm Account Deletion"
                 message="Are you sure you want to permanently delete your account? All your data, including order history and seller information (if applicable), will be lost. This action cannot be undone."
                 confirmButtonText="Yes, Delete My Account"
                 cancelButtonText="Cancel"
                 confirmButtonColor="red"
             />
        </>
    );
};

export default AccountPage;