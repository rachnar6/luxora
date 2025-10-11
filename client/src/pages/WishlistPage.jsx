import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { getSharedWithMe } from '../services/wishlistService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Heart, PlusCircle, Trash2, Search, Share2, Users, Calendar } from 'lucide-react';
import ConfirmationModal from '../components/common/ConfirmationModal';
import ShareWishlistModal from '../components/wishlist/ShareWishlistModal';

// 1. Add a currency formatting function
const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(value);
};

const WishlistPage = () => {
    const { wishlists, loading, error, createNewWishlist, removeWishlist, fetchWishlists } = useWishlist();
    const { token } = useAuth();

    const [newWishlistName, setNewWishlistName] = useState('');
    const [validUntilDate, setValidUntilDate] = useState('');
    const [wishlistToDelete, setWishlistToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMode, setActiveMode] = useState(null);

    const [activeTab, setActiveTab] = useState('myWishlists');
    const [sharedLists, setSharedLists] = useState([]);
    const [sharedLoading, setSharedLoading] = useState(true);

    const [selectedWishlist, setSelectedWishlist] = useState(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    useEffect(() => {
        const loadShared = async () => {
            if (token) {
                setSharedLoading(true);
                try {
                    const data = await getSharedWithMe(token);
                    setSharedLists(data);
                } catch (err) {
                    console.error("Failed to fetch shared wishlists", err);
                } finally {
                    setSharedLoading(false);
                }
            }
        };

        if (activeTab === 'sharedWithMe') {
            loadShared();
        }
    }, [token, activeTab]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (newWishlistName.trim()) {
            try {
                await createNewWishlist(newWishlistName, validUntilDate);
                setNewWishlistName('');
                setValidUntilDate('');
                setActiveMode(null);
            } catch (err) {
                console.error("Failed to create wishlist:", err);
            }
        }
    };

    const handleDeleteConfirm = () => {
        if (wishlistToDelete) {
            removeWishlist(wishlistToDelete._id);
            setWishlistToDelete(null);
        }
    };

    const openShareModal = (wishlist) => {
        setSelectedWishlist(wishlist);
        setIsShareModalOpen(true);
    };

    const listsToDisplay = activeTab === 'myWishlists' ? wishlists : sharedLists;

    const sortedAndFilteredLists = listsToDisplay
        .filter(list => list.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            const aIsActive = new Date(a.lastAccessed) > twoDaysAgo;
            const bIsActive = new Date(b.lastAccessed) > twoDaysAgo;

            if (aIsActive && !bIsActive) return -1;
            if (!aIsActive && bIsActive) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    const isLoading = activeTab === 'myWishlists' ? loading : sharedLoading;

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-5xl mx-auto my-8 dark:bg-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-extrabold text-gray-800 flex items-center gap-3 dark:text-gray-100">
                        <Heart className="w-10 h-10 text-primary" /> My Wishlists
                    </h1>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setActiveMode(activeMode === 'create' ? null : 'create')} 
                            title="Create New Wishlist" 
                            className={`p-2 rounded-full transition-colors ${activeMode === 'create' ? 'bg-primary text-white' : 'text-gray-600 hover:text-primary hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                        >
                            <PlusCircle size={24} />
                        </button>
                        <button 
                            onClick={() => setActiveMode(activeMode === 'search' ? null : 'search')} 
                            title="Search Wishlists" 
                            className={`p-2 rounded-full transition-colors ${activeMode === 'search' ? 'bg-primary text-white' : 'text-gray-600 hover:text-primary hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                        >
                            <Search size={24} />
                        </button>
                    </div>
                </div>

                <div className="border-b mb-6 dark:border-gray-700">
                    <nav className="-mb-px flex gap-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('myWishlists')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                                activeTab === 'myWishlists' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        >
                            <Heart size={16} /> My Wishlists
                        </button>
                        <button
                            onClick={() => setActiveTab('sharedWithMe')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                                activeTab === 'sharedWithMe' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        >
                           <Users size={16} /> Shared With Me
                        </button>
                    </nav>
                </div>
                
                <div className="space-y-4 mb-6">
                    {activeMode === 'create' && (
                        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700 animate-fade-in-down">
                            <form onSubmit={handleCreate} className="space-y-4">
                                <input
                                    type="text"
                                    value={newWishlistName}
                                    onChange={(e) => setNewWishlistName(e.target.value)}
                                    placeholder="Enter new wishlist name..."
                                    className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                    required autoFocus
                                />
                                <div className="relative">
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">Optional: Expiry Date</label>
                                    <Calendar className="absolute left-3 top-1/2 mt-2.5 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="date"
                                        value={validUntilDate}
                                        onChange={(e) => setValidUntilDate(e.target.value)}
                                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                        min={new Date().toISOString().split("T")[0]}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark">Create</button>
                                    <button type="button" onClick={() => setActiveMode(null)} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-lg">Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}
                    {activeMode === 'search' && (
                        <div className="relative animate-fade-in-down">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search wishlists by name..."
                                className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {isLoading ? <LoadingSpinner /> : (
                        sortedAndFilteredLists.length > 0 ? (
                            sortedAndFilteredLists.map(wishlist => {
                                const twoDaysAgo = new Date();
                                twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
                                const isActive = new Date(wishlist.lastAccessed) > twoDaysAgo;

                                // ✅ 2. Calculate the total value for this specific wishlist
                                const totalValue = wishlist.items.reduce((acc, item) => {
                                    // Safety check for items whose products might have been deleted
                                    return acc + (item.product ? item.product.price : 0);
                                }, 0);

                                return (
                                <div key={wishlist._id} className={`border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center transition-all duration-300 dark:border-gray-700 ${!isActive ? 'opacity-60 bg-gray-50 dark:bg-gray-700/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                    <Link to={`/wishlist/${wishlist._id}`} className="flex-grow mb-4 sm:mb-0">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} title={isActive ? 'Active' : 'Inactive'}></span>
                                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{wishlist.name}</h2>
                                            {wishlist.validUntil && (
                                                <span className="text-xs font-medium text-red-500 bg-red-100 px-2 py-1 rounded-full dark:bg-red-900/50 dark:text-red-300">
                                                    Expires: {new Date(wishlist.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="pl-6">
                                            {/* ✅ 3. Display the item count and the new total value */}
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {wishlist.items.length} items
                                                {totalValue > 0 && (
                                                    <span className="font-semibold text-gray-700 dark:text-gray-300"> • {formatCurrency(totalValue)}</span>
                                                )}
                                            </p>
                                            {activeTab === 'sharedWithMe' && (
                                                <p className="text-xs text-gray-400 mt-1">Shared by {wishlist.user?.name}</p>
                                            )}
                                        </div>
                                    </Link>
                                    
                                    <div className="flex items-center gap-3">
                                        {activeTab === 'myWishlists' && (
                                            <>
                                                <button onClick={() => openShareModal(wishlist)} title="Share" className="relative p-2 text-green-500 hover:bg-green-100 rounded-full dark:hover:bg-green-900/50">
                                                    <Share2 size={20} />
                                                    {wishlist.sharedWith && wishlist.sharedWith.length > 0 && (
                                                        <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                                            {wishlist.sharedWith.length}
                                                        </span>
                                                    )}
                                                </button>
                                                <button onClick={() => setWishlistToDelete(wishlist)} title="Delete" className="p-2 text-red-500 hover:bg-red-100 rounded-full dark:hover:bg-red-900/50">
                                                    <Trash2 size={20} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )})
                        ) : (
                            <p className="text-center text-gray-500 py-8 dark:text-gray-400">
                                {searchTerm ? "No wishlists match your search." : (activeTab === 'myWishlists' ? "You haven't created any wishlists yet." : "No wishlists have been shared with you yet.")}
                            </p>
                        )
                    )}
                </div>
            </div>
            
            {wishlistToDelete && (
                <ConfirmationModal
                    title="Delete Wishlist"
                    message={`Are you sure you want to permanently delete "${wishlistToDelete.name}"? This action cannot be undone.`}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setWishlistToDelete(null)}
                />
            )}

            {isShareModalOpen && (
                <ShareWishlistModal 
                    currentWishlist={selectedWishlist} 
                    onClose={() => { 
                        setIsShareModalOpen(false); 
                        fetchWishlists();
                    }} 
                />
            )}
        </>
    );
};

export default WishlistPage;

