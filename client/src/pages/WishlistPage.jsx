import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { getSharedWithMe } from '../services/wishlistService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Heart, PlusCircle, Trash2, Search, Share2, Users, Calendar } from 'lucide-react';
import ConfirmationModal from '../components/common/ConfirmationModal';
import ShareWishlistModal from '../components/wishlist/ShareWishlistModal';

// Currency formatting function
const formatCurrency = (value) => {
    // Safety check for valid number
    const numericValue = Number(value);
    if (isNaN(numericValue)) {
        return '₹0.00'; // Default value if input is not a number
    }
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(numericValue);
};

const WishlistPage = () => {
    // Context hooks
    const { wishlists, loading, error, createNewWishlist, removeWishlist, fetchWishlists } = useWishlist();
    const { token } = useAuth();

    // State for UI elements and data
    const [newWishlistName, setNewWishlistName] = useState('');
    const [validUntilDate, setValidUntilDate] = useState('');
    const [wishlistToDelete, setWishlistToDelete] = useState(null); // State to hold wishlist object for deletion modal
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMode, setActiveMode] = useState(null); // 'create', 'search', or null

    // State for tabs and shared wishlists
    const [activeTab, setActiveTab] = useState('myWishlists'); // 'myWishlists' or 'sharedWithMe'
    const [sharedLists, setSharedLists] = useState([]);
    const [sharedLoading, setSharedLoading] = useState(true);

    // State for sharing modal
    const [selectedWishlist, setSelectedWishlist] = useState(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    // --- DEBUGGING LOG ---
    // Log whenever the wishlistToDelete state changes
    useEffect(() => {
        console.log('WishlistPage: wishlistToDelete state changed to:', wishlistToDelete); 
    }, [wishlistToDelete]); 
    // --- END DEBUGGING LOG ---

    // Effect to load shared wishlists when the 'sharedWithMe' tab is active
    useEffect(() => {
        const loadShared = async () => {
            if (token) {
                setSharedLoading(true);
                try {
                    const data = await getSharedWithMe(token);
                    setSharedLists(data);
                } catch (err) {
                    console.error("Failed to fetch shared wishlists", err);
                    // Optionally set an error state for shared lists
                } finally {
                    setSharedLoading(false);
                }
            } else {
                 setSharedLists([]); // Clear if no token
                 setSharedLoading(false);
            }
        };

        if (activeTab === 'sharedWithMe') {
            loadShared();
        }
    }, [token, activeTab]);

    // Handler for creating a new wishlist
    const handleCreate = async (e) => {
        e.preventDefault();
        if (newWishlistName.trim()) {
            try {
                await createNewWishlist(newWishlistName, validUntilDate || null); // Pass null if date is empty
                setNewWishlistName('');
                setValidUntilDate('');
                setActiveMode(null); // Close the create form
            } catch (err) {
                console.error("Failed to create wishlist:", err);
                // Optionally show a user-facing error message
            }
        }
    };

    // Handler called by the ConfirmationModal when delete is confirmed
    const handleDeleteConfirm = () => {
        console.log('WishlistPage: handleDeleteConfirm function CALLED.'); // <-- Log function entry
        if (wishlistToDelete) {
            console.log('WishlistPage: Attempting to delete wishlist ID:', wishlistToDelete._id);
            removeWishlist(wishlistToDelete._id); // Call context function to delete
            setWishlistToDelete(null); // Close the modal
        } else {
            console.log('WishlistPage: handleDeleteConfirm called but wishlistToDelete is null.'); // Log if state is unexpectedly null
        }
    };

    // Handler to open the sharing modal
    const openShareModal = (wishlist) => {
        setSelectedWishlist(wishlist);
        setIsShareModalOpen(true);
    };

    // Determine which lists to display based on the active tab
    const listsToDisplay = activeTab === 'myWishlists' ? (wishlists || []) : (sharedLists || []); // Add fallback for potentially undefined lists

    // Filter and sort the lists for display
    const sortedAndFilteredLists = listsToDisplay
        .filter(list => list && list.name && list.name.toLowerCase().includes(searchTerm.toLowerCase())) // Add safety checks
        .sort((a, b) => {
            // Logic to sort by activity (recently accessed) then by creation date
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            const aIsActive = a.lastAccessed && new Date(a.lastAccessed) > twoDaysAgo;
            const bIsActive = b.lastAccessed && new Date(b.lastAccessed) > twoDaysAgo;

            if (aIsActive && !bIsActive) return -1; // Active lists first
            if (!aIsActive && bIsActive) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt); // Then newest first
        });

    // Determine loading state based on active tab
    const isLoading = activeTab === 'myWishlists' ? loading : sharedLoading;

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-5xl mx-auto my-8 dark:bg-gray-800">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 flex items-center gap-3 dark:text-gray-100">
                        <Heart className="w-8 h-8 md:w-10 md:h-10 text-primary" /> My Wishlists
                    </h1>
                    {/* Action Buttons (Create/Search) */}
                    <div className="flex items-center gap-2">
                        {/* Only show Create button on My Wishlists tab */}
                        {activeTab === 'myWishlists' && (
                            <button
                                onClick={() => setActiveMode(activeMode === 'create' ? null : 'create')}
                                title="Create New Wishlist"
                                className={`p-2 rounded-full transition-colors ${activeMode === 'create' ? 'bg-primary text-white' : 'text-gray-600 hover:text-primary hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                            >
                                <PlusCircle size={24} />
                            </button>
                        )}
                        <button
                            onClick={() => setActiveMode(activeMode === 'search' ? null : 'search')}
                            title="Search Wishlists"
                            className={`p-2 rounded-full transition-colors ${activeMode === 'search' ? 'bg-primary text-white' : 'text-gray-600 hover:text-primary hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                        >
                            <Search size={24} />
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
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

                {/* Create/Search Input Area */}
                <div className="space-y-4 mb-6">
                    {/* Create Wishlist Form */}
                    {activeMode === 'create' && activeTab === 'myWishlists' && (
                        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700 animate-fade-in-down">
                            <form onSubmit={handleCreate} className="space-y-4">
                                <input
                                    type="text"
                                    value={newWishlistName}
                                    onChange={(e) => setNewWishlistName(e.target.value)}
                                    placeholder="Enter new wishlist name..."
                                    className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-primary focus:border-primary"
                                    required autoFocus
                                />
                                <div className="relative">
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">Optional: Expiry Date</label>
                                    <Calendar className="absolute left-3 top-1/2 mt-2.5 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="date"
                                        value={validUntilDate}
                                        onChange={(e) => setValidUntilDate(e.target.value)}
                                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-primary focus:border-primary"
                                        min={new Date().toISOString().split("T")[0]} // Prevent selecting past dates
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">Create</button>
                                    <button type="button" onClick={() => setActiveMode(null)} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}
                    {/* Search Input */}
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

                {/* Wishlist Display Area */}
                <div className="space-y-4">
                    {/* Loading State */}
                    {isLoading && <LoadingSpinner />}
                    
                    {/* Error State */}
                    {!isLoading && error && activeTab === 'myWishlists' && (
                         <div className="text-center text-red-500 py-8">{error}</div>
                    )}
                    
                    {/* Empty State / List Display */}
                    {!isLoading && (
                        sortedAndFilteredLists.length > 0 ? (
                            sortedAndFilteredLists.map(wishlist => {
                                // Calculate activity status (within last 2 days)
                                const twoDaysAgo = new Date();
                                twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
                                const isActive = wishlist.lastAccessed && new Date(wishlist.lastAccessed) > twoDaysAgo;

                                // Calculate total value of items in the wishlist
                                const totalValue = wishlist.items?.reduce((acc, item) => { // Added optional chaining
                                    // Safety check for items whose products might have been deleted or lack price
                                    return acc + (item?.product?.price ? Number(item.product.price) : 0);
                                }, 0) || 0; // Default to 0 if items array is missing

                                return (
                                    <div key={wishlist._id} className={`border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center transition-all duration-300 dark:border-gray-700 ${!isActive ? 'opacity-60 bg-gray-50 dark:bg-gray-700/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                        {/* Wishlist Name, Item Count, Value */}
                                        <Link to={`/wishlist/${wishlist._id}`} className="flex-grow mb-4 sm:mb-0 w-full sm:w-auto"> {/* Ensure link takes full width on mobile */}
                                            <div className="flex items-center gap-3">
                                                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} title={isActive ? 'Active (Accessed recently)' : 'Inactive'}></span>
                                                <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 truncate" title={wishlist.name}>{wishlist.name}</h2>
                                                {/* Expiry Date Badge */}
                                                {wishlist.validUntil && (
                                                    <span className="text-xs font-medium text-red-500 bg-red-100 px-2 py-1 rounded-full dark:bg-red-900/50 dark:text-red-300 whitespace-nowrap">
                                                        Expires: {new Date(wishlist.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="pl-6 mt-1"> {/* Indent details */}
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {wishlist.items?.length || 0} items {/* Safely access length */}
                                                    {totalValue > 0 && (
                                                        <span className="font-semibold text-gray-700 dark:text-gray-300"> • {formatCurrency(totalValue)}</span>
                                                    )}
                                                </p>
                                                {/* Show 'Shared by' only on the Shared With Me tab */}
                                                {activeTab === 'sharedWithMe' && wishlist.user?.name && (
                                                    <p className="text-xs text-gray-400 mt-1">Shared by {wishlist.user.name}</p>
                                                )}
                                            </div>
                                        </Link>

                                        {/* Action Buttons (Share/Delete) - Only on My Wishlists tab */}
                                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                            {activeTab === 'myWishlists' && (
                                                <>
                                                    {/* Share Button */}
                                                    <button onClick={() => openShareModal(wishlist)} title="Share Wishlist" className="relative p-2 text-green-500 hover:bg-green-100 rounded-full dark:hover:bg-green-900/50 transition-colors">
                                                        <Share2 size={20} />
                                                        {/* Badge showing number of people shared with */}
                                                        {wishlist.sharedWith && wishlist.sharedWith.length > 0 && (
                                                            <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                                                {wishlist.sharedWith.length}
                                                            </span>
                                                        )}
                                                    </button>
                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={() => {
                                                            console.log('WishlistPage: Delete icon clicked for wishlist:', wishlist.name, wishlist._id); // <-- Log click
                                                            setWishlistToDelete(wishlist); // Set state to open modal
                                                        }}
                                                        title="Delete Wishlist"
                                                        className="p-2 text-red-500 hover:bg-red-100 rounded-full dark:hover:bg-red-900/50 transition-colors"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </>
                                            )}
                                            {/* Maybe add a 'Leave Shared Wishlist' button here for the shared tab later */}
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            // Empty state message
                            <p className="text-center text-gray-500 py-8 dark:text-gray-400">
                                {searchTerm ? "No wishlists match your search." : (activeTab === 'myWishlists' ? "You haven't created any wishlists yet. Click '+' to start!" : "No wishlists have been shared with you yet.")}
                            </p>
                        )
                    )}
                </div>
            </div>

            {/* Confirmation Modal for Deletion */}
            {wishlistToDelete && (
                <ConfirmationModal
                    isOpen={!!wishlistToDelete} // Control visibility based on state
                    title="Delete Wishlist"
                    message={`Are you sure you want to permanently delete "${wishlistToDelete.name}"? All items and shared access will be lost. This action cannot be undone.`}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setWishlistToDelete(null)} // Function to close modal
                    confirmButtonText="Yes, Delete"
                />
            )}

            {/* Share Wishlist Modal */}
            {isShareModalOpen && selectedWishlist && ( // Ensure selectedWishlist is not null
                <ShareWishlistModal
                    currentWishlist={selectedWishlist}
                    onClose={() => {
                        setIsShareModalOpen(false);
                        setSelectedWishlist(null); // Clear selected wishlist
                        // Re-fetch might be needed if sharing modifies the main list data significantly
                        fetchWishlists(); 
                    }}
                />
            )}
        </>
    );
};

export default WishlistPage;