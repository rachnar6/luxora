import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getWishlistById, voteOnItem, addComment } from '../services/wishlistService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Gift, MessageSquare, ThumbsUp, ShieldAlert, Send } from 'lucide-react';

const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'N/A';
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(value);
};

const SharedWishlistPage = () => {
    const { id: wishlistId } = useParams(); // Use 'id' from the URL
    const { user, token: authToken } = useAuth();
    const [wishlist, setWishlist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);
    const [error, setError] = useState('');
    const [commentInputs, setCommentInputs] = useState({});

    // This function fetches the wishlist data
    const fetchWishlist = async () => {
        try {
            // Use the correct function for private sharing
            const data = await getWishlistById(wishlistId, authToken);
            setWishlist(data);
        } catch (err) {
            if (err.response && err.response.status === 403) {
                setAccessDenied(true);
            } else {
                setError(err.response?.data?.message || 'Failed to load wishlist.');
            }
        } finally {
            setLoading(false);
        }
    };
    
    // Fetch data on initial load
    useEffect(() => {
        if (wishlistId && authToken) {
            fetchWishlist();
        } else if (!authToken) {
            setAccessDenied(true);
            setLoading(false);
        }
    }, [wishlistId, authToken]);
    
    // Polling to refresh chat every 5 seconds
    useEffect(() => {
        if (wishlistId && authToken) {
            const interval = setInterval(fetchWishlist, 5000);
            return () => clearInterval(interval);
        }
    }, [wishlistId, authToken]);

    const handleVote = async (productId) => {
        if (!wishlist.shareToken) return; // Can't vote on private-only lists yet
        try {
            const updatedWishlist = await voteOnItem(authToken, wishlist.shareToken, productId);
            setWishlist(updatedWishlist);
        } catch (err) {
            console.error("Failed to vote:", err);
        }
    };

    const handleCommentSubmit = async (productId) => {
        const text = commentInputs[productId];
        if (!text || !text.trim() || !wishlist.shareToken) return;
        try {
            const updatedWishlist = await addComment(authToken, wishlist.shareToken, productId, text);
            setWishlist(updatedWishlist);
            setCommentInputs({ ...commentInputs, [productId]: '' });
        } catch (err) {
            console.error("Failed to add comment:", err);
        }
    };

    if (loading) return <LoadingSpinner />;

    if (accessDenied) {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md mx-auto my-12">
                <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-gray-600 mt-2">You must be logged in and have permission to view this wishlist.</p>
            </div>
        );
    }

    if (error) return <div className="text-center text-red-500 mt-8 text-xl">{error}</div>;
    if (!wishlist) return <div className="text-center text-gray-500 mt-8 text-xl">Wishlist not found.</div>;

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-5xl mx-auto my-8">
            <div className="text-center mb-8">
                <Gift className="w-16 h-16 text-primary mx-auto mb-4" />
                <h1 className="text-5xl font-extrabold text-text-dark">{wishlist.user.name}'s Wishlist</h1>
                <p className="text-gray-600 text-lg mt-2">Feel free to comment or vote on your favorite items!</p>
            </div>

            <div className="space-y-6">
                {wishlist.items.map(item => {
                    if (!item || !item.product) return null;
                    const product = item.product;
                    const hasVoted = user && item.votes.includes(user.id);
                    const votePercentage = (wishlist.sharedWith.length + 1 > 0) ? (item.votes.length / (wishlist.sharedWith.length + 1)) * 100 : 0;

                    return (
                        <div key={item._id} className="border-b border-gray-200 pb-6 mb-6">
                            <div className="flex items-center">
                                <Link to={`/product/${product._id}`} className="w-32 h-32 flex-shrink-0 mr-6">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-md"/>
                                </Link>
                                <div className="flex-grow">
                                    <Link to={`/product/${product._id}`} className="text-2xl font-semibold text-text-dark hover:text-primary">{product.name}</Link>
                                    <p className="text-gray-700 text-xl mt-1">{formatCurrency(product.price)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-4">
                                <button onClick={() => handleVote(product._id)} disabled={!wishlist.shareToken || hasVoted} className={`inline-flex items-center px-4 py-2 rounded-lg transition ${hasVoted ? 'bg-green-500 text-white cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed'}`}>
                                    <ThumbsUp className="w-5 h-5 mr-2" /> {hasVoted ? 'Voted' : 'Vote'}
                                </button>
                                <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden flex items-center">
                                    <div className="h-full bg-green-500 transition-all" style={{ width: `${votePercentage}%` }}></div>
                                    <span className="text-xs font-bold text-gray-600 ml-2">{item.votes.length} Votes</span>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-gray-600" /> Live Chat</h3>
                                <div className="space-y-3 max-h-40 overflow-y-auto pr-2 mb-3">
                                    {item.comments && item.comments.length > 0 ? (
                                        item.comments.map(comment => (
                                            <div key={comment._id} className="text-sm">
                                                <span className="font-semibold">{comment.name}:</span> {comment.text}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
                                    )}
                                </div>
                                <div className="flex mt-4 gap-2">
                                    <input type="text" placeholder="Add a message..." className="flex-grow p-2 border border-gray-300 rounded-lg text-sm" value={commentInputs[product._id] || ''} onChange={(e) => setCommentInputs({...commentInputs, [product._id]: e.target.value})} onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(product._id)} disabled={!wishlist.shareToken} />
                                    <button onClick={() => handleCommentSubmit(product._id)} className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50" disabled={!wishlist.shareToken}><Send size={20} /></button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SharedWishlistPage;