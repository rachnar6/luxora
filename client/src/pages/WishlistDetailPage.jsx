import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getWishlistById, rateWishlistItem } from '../services/wishlistService';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ShareWishlistModal from '../components/wishlist/ShareWishlistModal';
import VotersListModal from '../components/wishlist/VotersListModal';
import AddProductsModal from '../components/wishlist/AddProductsModal';
import { Heart, Users, ThumbsUp, ThumbsDown, PlusCircle, Trash2 } from 'lucide-react';

const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(value);
};

const WishlistDetailPage = () => {
    const { id: wishlistId } = useParams();
    const { token, user } = useAuth();
    const { removeItem } = useWishlist();
    
    const [wishlist, setWishlist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [isAddProductsModalOpen, setIsAddProductsModalOpen] = useState(false);

    const loadWishlist = useCallback(async () => {
        if (!token || !wishlistId) return;
        try {
            if (!wishlist) setLoading(true);
            const data = await getWishlistById(wishlistId, token);
            setWishlist(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch wishlist details.');
        } finally {
            setLoading(false);
        }
    }, [wishlistId, token, wishlist]);

    useEffect(() => {
        loadWishlist();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wishlistId]);

    const handleRating = async (itemId, voteType) => {
        try {
            const updatedWishlist = await rateWishlistItem(wishlistId, itemId, voteType, token);
            setWishlist(updatedWishlist);
        } catch (err) {
            console.error("Failed to rate item:", err);
        }
    };

    const handleRemoveItem = async (itemId) => {
        if (window.confirm('Are you sure you want to remove this item from the wishlist?')) {
            await removeItem(wishlistId, itemId);
            loadWishlist(); // Refresh the list
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-500 mt-8">{error}</div>;
    if (!wishlist) return <div className="text-center text-gray-500 mt-8">Wishlist not found.</div>;

const loggedInUserId = user?.id || user?._id;
const isOwner = !!(wishlist?.user?._id && loggedInUserId && wishlist.user._id.toString() === loggedInUserId.toString());
const totalValue = wishlist.items.reduce((acc, item) => acc + (item.product ? item.product.price : 0), 0);

console.log("--- DEBUGGING DATA ---");
console.log("Logged-in User (from Auth Context):", user);
console.log("Wishlist Owner (from API):", wishlist?.user);

console.log("Is Owner?:", isOwner);
console.log("--- END DEBUGGING ---");

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-5xl mx-auto my-8 dark:bg-gray-800">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-800 flex items-center gap-3 dark:text-gray-100">
                            <Heart className="w-10 h-10 text-primary" /> {wishlist.name}
                        </h1>
                        <p className="text-gray-500 mt-1 dark:text-gray-400">Owned by: {wishlist.user?.name}</p>
                    </div>
                     <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                        {totalValue > 0 && (
                            <div className="text-right font-bold text-2xl text-primary">
                                Total: {formatCurrency(totalValue)}
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            {/* This block will now render correctly */}
                            {isOwner && (
                                <>
                                    <button onClick={() => setIsAddProductsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors">
                                        <PlusCircle size={20} /> Add Products
                                    </button>
                                    <button onClick={() => setIsShareModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                                        <Users size={20} /> Share
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                
                <p className="text-sm text-gray-500 mb-8 dark:text-gray-400">
                    Currently shared with {wishlist.sharedWith?.length || 0} people.
                </p>

                <div className="space-y-4">
                    {wishlist.items.length > 0 ? (
                        wishlist.items.filter(item => item.product).map((item) => {
                            const likers = item.ratings.filter(r => r.vote === 'like').map(r => r.user).filter(Boolean);
                            const dislikers = item.ratings.filter(r => r.vote === 'dislike').map(r => r.user).filter(Boolean);
                            const myVote = item.ratings.find(r => (r.user?._id || r.user) === user._id)?.vote;

                            return (
                                <div key={item._id} className="border rounded-lg p-4 flex items-center gap-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50">
                                    <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover rounded-md" />
                                    <div className="flex-grow">
                                        <Link to={`/product/${item.product._id}`} className="text-lg font-semibold text-gray-800 hover:text-primary dark:text-gray-200">
                                            {item.product.name}
                                        </Link>
                                        <p className="text-lg font-bold text-primary">{formatCurrency(item.product.price)}</p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {isOwner ? (
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => likers.length > 0 && setModalData({ title: 'Liked By', users: likers, voteType: 'like' })} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 disabled:hover:text-gray-600 disabled:cursor-not-allowed dark:text-gray-300" disabled={likers.length === 0}>
                                                    <ThumbsUp size={20} className="text-blue-500" /> {likers.length}
                                                </button>
                                                <button onClick={() => dislikers.length > 0 && setModalData({ title: 'Disliked By', users: dislikers, voteType: 'dislike' })} className="flex items-center gap-2 text-gray-600 hover:text-red-600 disabled:hover:text-gray-600 disabled:cursor-not-allowed dark:text-gray-300" disabled={dislikers.length === 0}>
                                                    <ThumbsDown size={20} className="text-red-500" /> {dislikers.length}
                                                </button>
                                                <button onClick={() => handleRemoveItem(item._id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full dark:hover:bg-red-900/50" title="Remove Item">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleRating(item._id, 'like')} className={`p-2 rounded-full transition-colors ${myVote === 'like' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-blue-100 dark:bg-gray-600 dark:hover:bg-gray-500'}`}>
                                                    <ThumbsUp size={20} />
                                                </button>
                                                <button onClick={() => handleRating(item._id, 'dislike')} className={`p-2 rounded-full transition-colors ${myVote === 'dislike' ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-red-100 dark:bg-gray-600 dark:hover:bg-gray-500'}`}>
                                                    <ThumbsDown size={20} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg dark:border-gray-600">
                            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">This wishlist is empty!</p>
                            {isOwner && (
                                <button onClick={() => setIsAddProductsModalOpen(true)} className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors">
                                    Add Your First Product
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {isShareModalOpen && <ShareWishlistModal currentWishlist={wishlist} onClose={() => { setIsShareModalOpen(false); loadWishlist(); }} />}
            {modalData && <VotersListModal {...modalData} onClose={() => setModalData(null)} />}
            {isAddProductsModalOpen && (
                <AddProductsModal 
                    wishlist={wishlist} 
                    onClose={() => {
                        setIsAddProductsModalOpen(false);
                        loadWishlist();
                    }} 
                />
            )}
        </>
    );
};

export default WishlistDetailPage;