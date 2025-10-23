import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Box, MessageSquare, Settings, LogOut, X, LayoutDashboard, ShoppingBag, Users as AdminUsersIcon, List as AdminListIcon, Briefcase as AdminBriefcaseIcon, Package as SellerPackageIcon } from 'lucide-react';
import SettingsPanel from './SettingsPanel';

const UserProfileSidebar = ({ isOpen, onClose, openChatbot }) => {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Make sure user object exists before proceeding
    if (!isOpen || !user) return null;

    const handleNavigate = (path) => {
        navigate(path);
        onClose();
    };

    const handleLogout = () => {
        logoutUser();
        onClose();
        navigate('/login');
    };

    const openSettings = () => {
        setIsSettingsOpen(true);
        // onClose(); // Optional: Close main sidebar when settings open
    };

    // Dynamically build menuItems based on user role
    const buildMenuItems = () => {
        let items = [
            { icon: User, label: 'Profile', description: 'View and edit profile', path: '/profile' },
        ];

        // Add "My Orders" only for non-admins
        if (!user.isAdmin) {
            items.push({ icon: Box, label: 'My Orders', description: 'Track your orders', path: '/orders' });
        }

        // Add Seller links if user is a seller
        if (user.isSeller) {
            items.push(
                { isHeader: true, label: 'Seller Panel' },
                { icon: User, label: 'Store Profile', description: 'Manage your public profile', path: '/seller/profile' },
                { icon: SellerPackageIcon, label: 'My Products', description: 'Manage your listings', path: '/seller/productlist' },
                { icon: ShoppingBag, label: 'My Sales', description: 'View received orders', path: '/seller/orders' }
            );
        }

        // Add Admin links only if user is an admin
        if (user.isAdmin) {
            items.push(
                { isHeader: true, label: 'Admin Panel' },
                // { icon: LayoutDashboard, label: 'Dashboard', description: 'Overview', path: '/admin' }, // Add if you have an admin dashboard page
                { icon: AdminUsersIcon, label: 'Users', description: 'Manage all users', path: '/admin/userlist' },
                { icon: AdminUsersIcon, label: 'Sellers', description: 'Manage sellers', path: '/admin/sellerlist' },
                { icon: SellerPackageIcon, label: 'All Products', description: 'Manage all products', path: '/admin/productlist' },
                { icon: AdminListIcon, label: 'All Orders', description: 'Manage all orders', path: '/admin/orderlist' },
                { icon: AdminBriefcaseIcon, label: 'Seller Apps', description: 'Review applications', path: '/admin/seller-applications' }
            );
        }

        // Add common items at the end
        items.push(
            { isHeader: true, label: 'Support & Settings'},
            // --- THIS IS THE FIX ---
            { icon: MessageSquare, label: 'Chat Support', description: 'Get help instantly', path: '/customer-service' },
            // ------------------------
            { icon: Settings, label: 'Settings', description: 'Customize your experience', action: openSettings }
        );

        return items;
    };

    const menuItems = buildMenuItems();

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>
            <div className="fixed top-0 right-0 w-80 h-full bg-gradient-to-b from-purple-400 via-pink-500 to-red-500 dark:from-gray-800 dark:to-black shadow-xl z-50 p-6 flex flex-col text-white animate-slide-in-right">
                <button onClick={onClose} className="absolute top-4 right-4 text-white p-1 rounded-full hover:bg-white/20">
                    <X size={24} />
                </button>

                {/* User Info */}
                <div className="flex flex-col items-center mb-6 pt-8 flex-shrink-0">
                        <img
                            src={user?.profilePicture || '/images/default-avatar.png'}
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover border-2 border-white/50 mb-3 bg-white/30"
                            onError={(e) => { e.target.onerror = null; e.target.src='/images/default-avatar.png';}}
                        />
                    <h2 className="text-xl font-semibold">{user.name}</h2>
                    <p className="text-sm text-gray-200">{user.email}</p>
                         {/* This logic correctly checks for role OR the new boolean flags */}
                         <span className={`mt-2 text-xs font-semibold px-2 py-0.5 rounded ${
                             user.isAdmin ? 'bg-red-500' :
                             user.isSeller ? 'bg-blue-500' :
                             'bg-green-500'
                         }`}>
                             {user.isAdmin ? 'Admin' : user.isSeller ? 'Seller' : 'Customer'}
                         </span>
                </div>

                {/* Menu Items */}
                <nav className="flex-grow space-y-1 overflow-y-auto pr-2 -mr-2">
                    {menuItems.map((item, index) => (
                        item.isHeader ? (
                            <div key={`header-${index}`} className="pt-3 pb-1 px-3 text-xs font-bold uppercase text-white/60">
                                {item.label}
                            </div>
                        ) : (
                            <button
                                key={index}
                                onClick={item.path ? () => handleNavigate(item.path) : (item.action || (() => {}))}
                                className="w-full flex items-center p-3 rounded-lg hover:bg-white/10 transition-colors text-left"
                            >
                                {item.icon && <item.icon size={20} className="mr-3 text-white/80 flex-shrink-0" />}
                                <div className="flex-grow">
                                    <span className="font-medium text-sm">{item.label}</span>
                                    {item.description && <p className="text-xs text-gray-200">{item.description}</p>}
                                </div>
                            </button>
                        )
                    ))}
                </nav>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center p-3 rounded-lg hover:bg-white/10 transition-colors mt-4 text-left flex-shrink-0 border-t border-white/20 pt-4"
                >
                    <LogOut size={20} className="mr-3 text-white/80" />
                    <div>
                        <span className="font-medium text-sm">Logout</span>
                        <p className="text-xs text-gray-200">Sign out of your account</p>
                    </div>
                </button>
            </div>

            <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </>
    );
};

export default UserProfileSidebar;