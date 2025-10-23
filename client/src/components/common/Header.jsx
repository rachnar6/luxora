import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useProducts } from '../../contexts/ProductContext';
import { useTheme } from '../../contexts/ThemeContext'; // Ensure this path is correct
import { getUniqueCategories } from '../../services/productService';
import UserProfileSidebar from './UserProfileSidebar'; // Import the new Profile Sidebar
import {
    ShoppingCart, Heart, LogIn, Home, Menu, X, User, LogOut, List, ChevronDown, ChevronUp,
    Gift, TrendingUp, Clock, Info, Package, Users, Briefcase, ShoppingBag, Globe, Sun, Moon
} from 'lucide-react';

const Header = () => {
    const { user, logoutUser } = useAuth();
    const { cartItems } = useCart();
    const { setCategory, setBrand } = useProducts();
    const { theme, setTheme } = useTheme(); // Use setTheme from context
    const navigate = useNavigate();
    const location = useLocation();

    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For the main category sidebar
    const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false); // For the user profile sidebar
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);
    const [isHelpExpanded, setIsHelpExpanded] = useState(false);
    const [dynamicCategories, setDynamicCategories] = useState([]);

    const langMenuRef = useRef(null);

    // Close language menu on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
                setIsLangMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch categories
    useEffect(() => {
        const fetchCategoriesForMenu = async () => {
            try {
                const data = await getUniqueCategories();
                setDynamicCategories(data);
            } catch (error) {
                console.error("Failed to fetch categories for menu:", error);
            }
        };
        if (user?.role !== 'admin') {
            fetchCategoriesForMenu();
        }
    }, [user]);

    // Google Translate Widget
    useEffect(() => {
        if (window.google && window.google.translate && document.querySelector('.goog-te-combo')) {
             return;
        }
        if (!document.getElementById("google-translate-script")) {
            const addScript = document.createElement("script");
            addScript.id = "google-translate-script";
            addScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            document.body.appendChild(addScript);
            window.googleTranslateElementInit = () => {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: "en",
                        includedLanguages: "en,ta,hi,te,ml,kn,ur,gu",
                        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                        autoDisplay: false,
                    },
                    "google_translate_element"
                );
            };
        }
    }, []);

    const languages = [
        { code: 'en', name: 'English' }, { code: 'hi', name: 'Hindi (हिन्दी)' },
        { code: 'ta', name: 'Tamil (தமிழ்)' }, { code: 'te', name: 'Telugu (తెలుగు)' },
        { code: 'ml', name: 'Malayalam (മലയാളം)' }, { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
        { code: 'ur', name: 'Urdu (اردو)' }, { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
    ];

    const changeLanguage = (langCode) => {
        const googleTranslateSelect = document.querySelector('select.goog-te-combo');
        if (googleTranslateSelect) {
            googleTranslateSelect.value = langCode;
            googleTranslateSelect.dispatchEvent(new Event('change'));
        } else {
            document.cookie = `googtrans=/en/${langCode}; path=/`;
            window.location.reload();
        }
        setIsLangMenuOpen(false);
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
        // Handle 'blue' theme toggle if needed, or manage it via SettingsPanel
    };

    const cartItemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

    const handleLogout = () => {
        logoutUser();
        setIsProfileSidebarOpen(false); // Close profile sidebar on logout
        navigate('/login');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        if (!isSidebarOpen) {
            setIsCategoriesExpanded(true);
            setIsHelpExpanded(false);
        }
    };

    const handleCategoryClick = (cat) => {
        setCategory(cat);
        setBrand('');
        toggleSidebar();
        navigate(`/?category=${cat}`);
    };

    const toggleCategories = () => setIsCategoriesExpanded(!isCategoriesExpanded);
    const toggleHelp = () => setIsHelpExpanded(!isHelpExpanded);

    const helpLinks = [
        { name: 'Your Account', path: '/profile' }, { name: 'Customer Service', path: '/customer-service' },
        { name: 'FAQs', path: '/faqs' }, { name: 'Returns & Orders', path: '/returns-&-orders' },
        { name: 'Contact Us', path: '/contact-us' },
    ];

    return (
        <>
            <header className="bg-white text-gray-800 p-4 shadow-md sticky top-0 z-50 dark:bg-gray-800 dark:text-gray-200 dark:border-b dark:border-gray-700">
                <div className="container mx-auto flex justify-between items-center">
                    {/* Left Side (Menu Button) */}
                    <div className="flex-1 flex justify-start items-center">
                        {user?.role !== 'admin' && (
                            <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Open menu">
                                <Menu className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    {/* Center (Logo) */}
                    <div className="flex-1 flex justify-center">
                        <Link to="/" className="text-3xl font-bold text-primary flex items-center gap-2">
                           <span>LUXORA</span>
                        </Link>
                    </div>

                    {/* Right Side Icons */}
                    <div className="flex-1 flex items-center justify-end space-x-2 sm:space-x-4">
                        <Link to="/" className="hidden lg:flex items-center gap-2 font-semibold hover:text-primary transition-colors">
                            <Home className="w-5 h-5" />
                        </Link>

                        {user?.role !== 'admin' && (
                            <>
                                <Link to="/cart" className="relative hover:text-primary transition-colors" aria-label="Shopping cart">
                                    <ShoppingCart className="w-6 h-6" />
                                    {cartItemCount > 0 && (
                                        <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartItemCount}</span>
                                    )}
                                </Link>
                                <Link to="/wishlist" className="hidden sm:flex hover:text-primary transition-colors" aria-label="Wishlist">
                                    <Heart className="w-6 h-6" />
                                </Link>
                            </>
                        )}

                        {user ? (
                            <button onClick={() => setIsProfileSidebarOpen(true)} className="flex items-center gap-1 font-semibold hover:text-primary transition-colors">
                                <span className="hidden sm:inline">{user?.name?.split(' ')[0] || 'Account'}</span>
                                <User className="w-5 h-5 sm:hidden"/>
                                <ChevronDown className="w-4 h-4 hidden sm:inline"/>
                            </button>
                        ) : (
                            <Link to="/login" className="hidden lg:flex items-center gap-1 font-semibold hover:text-primary transition-colors">
                                <LogIn className="w-5 h-5" /> Login
                            </Link>
                        )}

                        <div id="google_translate_element" style={{ display: 'none' }}></div>
                    </div>
                </div>

                {/* Main Category Sidebar */}
                <div className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl z-30 transform transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-6 border-b flex justify-between items-center bg-primary text-white dark:bg-gray-700">
                        <h3 className="text-xl font-bold">Menu</h3>
                        <button onClick={toggleSidebar} className="text-white hover:text-gray-200" aria-label="Close menu">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <nav className="p-6 overflow-y-auto h-[calc(100%-72px)] text-gray-800 dark:text-gray-200">
                        {user && (
                            <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                                <p className="text-lg font-semibold flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" /> Hello, {user?.name || 'User'}
                                </p>
                            </div>
                        )}

                        {user?.role !== 'admin' && (
                            <>
                                <div className="mb-6">
                                    <button onClick={toggleCategories} className="w-full text-left font-semibold mb-3 flex items-center justify-between">
                                        <span><List className="w-5 h-5 inline mr-2" /> Shop by Category</span>
                                        {isCategoriesExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </button>
                                    {isCategoriesExpanded && (
                                        <ul className="space-y-2 mt-2 pl-4">
                                            {dynamicCategories.map((cat) => (
                                                <li key={cat}>
                                                    <button onClick={() => handleCategoryClick(cat)} className="block w-full text-left py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary">
                                                        {cat}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="mb-6 border-t dark:border-gray-700 pt-6">
                                    <h4 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Quick Links</h4>
                                    <ul className="space-y-2 pl-4">
                                        <li><Link to="/deals" onClick={toggleSidebar} className="py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary flex items-center gap-2"><Gift className="w-4 h-4 text-red-500" /> Deals</Link></li>
                                        <li><Link to="/top-selling" onClick={toggleSidebar} className="py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-500" /> Top Selling</Link></li>
                                        <li><Link to="/latest" onClick={toggleSidebar} className="py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> New Arrivals</Link></li>
                                    </ul>
                                </div>
                                <div className="mb-6 border-t dark:border-gray-700 pt-6">
                                    <button onClick={toggleHelp} className="w-full text-left font-semibold mb-3 flex items-center justify-between">
                                        <span><Info className="w-5 h-5 inline mr-2" /> Help & Settings</span>
                                        {isHelpExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </button>
                                    {isHelpExpanded && (
                                        <ul className="space-y-2 mt-2 pl-4">
                                            {helpLinks.map((link) => (
                                                <li key={link.name}>
                                                    <Link to={link.path} onClick={toggleSidebar} className="block py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary">
                                                        {link.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </>
                        )}

                        {user ? (
                            <div className="border-t dark:border-gray-700 pt-6">
                                <button onClick={() => { handleLogout(); toggleSidebar(); }} className="w-full text-left py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <LogOut className="w-5 h-5" /> Logout
                                </button>
                            </div>
                        ) : (
                            <div className="border-t dark:border-gray-700 pt-6">
                                <Link to="/login" onClick={toggleSidebar} className="py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <LogIn className="w-5 h-5" /> Login
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            {/* Render the UserProfileSidebar */}
            <UserProfileSidebar 
                isOpen={isProfileSidebarOpen} 
                onClose={() => setIsProfileSidebarOpen(false)} 
            />
        </>
    );
};

export default Header;
