import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductDetails, createProductReview, getRelatedProducts } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';

import LoadingSpinner from '../components/common/LoadingSpinner';
import NotificationToast from '../components/common/NotificationToast';
import AddToWishlistModal from '../components/wishlist/AddToWishlistModal';
import ProductCard from '../components/products/ProductCard';
import { ShoppingCart, Heart, ArrowLeft, Star, Send, Edit3, MessageSquare, Store, ShieldCheck } from 'lucide-react';

// --- Helper Components ---
const formatCurrency = (value) => {
    const numericValue = Number(value);
    if (isNaN(numericValue)) {
        return '₹0.00';
    }
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(numericValue);
};

const Rating = ({ value, text }) => {
    const roundedValue = Math.round(value || 0);
    return (
        <div className="flex items-center">
            <div className="flex text-yellow-500 mr-2">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < roundedValue ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                ))}
            </div>
            {text && <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>}
        </div>
    );
};

// --- Main Component ---
const ProductPage = () => {
    const { id: productId } = useParams();
    const navigate = useNavigate();
    const { user: userInfo } = useAuth();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qty, setQty] = useState(1);
    const { addItem: addItemToCart, buyNowItem, error: cartError } = useCart();
    const { wishlists, setWishlist, addNoteToWishlist: addNoteService } = useWishlist();
    const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('info');
    const [note, setNote] = useState('');
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);

    const wishlistItem = wishlists?.flatMap(list => list.items).find(item => item.product?._id === product?._id);
    const isInWishlist = !!wishlistItem;
    const productInWishlistIds = wishlists?.filter(list => list.items.some(item => item.product?._id === product?._id)).map(list => list._id) || [];

    useEffect(() => {
        if (wishlistItem) {
            setNote(wishlistItem.notes || '');
        } else {
            setNote('');
        }
    }, [wishlistItem]);

    useEffect(() => {
        const fetchProductData = async () => {
            window.scrollTo(0, 0);
            try {
                setLoading(true);
                setError(null);
                const [productData, relatedData] = await Promise.all([
                    getProductDetails(productId),
                    getRelatedProducts(productId)
                ]);
                setProduct(productData);
                setRelatedProducts(relatedData);
            } catch (err) {
                console.error("Fetch product error:", err);
                setError(err.response?.data?.message || err.message || 'Failed to fetch product data');
            } finally {
                setLoading(false);
            }
        };
        fetchProductData();
    }, [productId]);

    // --- Action Handlers ---

    const handleAddToCart = async () => {
        if (!product || product.countInStock < qty) return;
        try {
            await addItemToCart(product._id, qty);
            setToastMessage(`${product.name} added to cart!`);
            setToastType('success');
            setShowToast(true);
        } catch (error) {
            setToastMessage(cartError || 'Failed to add to cart.');
            setToastType('error');
            setShowToast(true);
        }
    };

    const handleBuyNow = async () => {
        if (!product || product.countInStock < qty) return;
        try {
            await buyNowItem(product._id, qty);
            navigate('/checkout');
        } catch (error) {
            setToastMessage(cartError || 'Failed to process purchase.');
            setToastType('error');
            setShowToast(true);
        }
    };

    const handleRecommend = async () => {
        const shareData = {
            title: product?.name || 'Check this out!',
            text: `Check out this amazing product: ${product?.name || 'Product'}`,
            url: window.location.href
        };
        if (navigator.share && product) {
            try {
                await navigator.share(shareData);
            } catch (err) { console.error("Share failed:", err); }
        } else {
            try {
                await navigator.clipboard.writeText(shareData.url);
                setToastMessage('Product link copied to clipboard!');
                setToastType('success');
            } catch (err) {
                setToastMessage('Failed to copy link.');
                setToastType('error');
            } finally {
                setShowToast(true);
            }
        }
    };

    const handleNoteSave = async () => {
        try {
            const parentWishlist = wishlists?.find(w => w.items.some(i => i._id === wishlistItem?._id));
            if (parentWishlist && wishlistItem && addNoteService) {
                await addNoteService(parentWishlist._id, wishlistItem._id, note);
                setIsEditingNote(false);
                setToastMessage('Note saved successfully!');
                setToastType('success');
            } else {
                throw new Error("Could not find wishlist or item to save note.");
            }
        } catch (err) {
            console.error('Failed to save wishlist note', err);
            setToastMessage('Failed to save note.');
            setToastType('error');
        } finally {
            setShowToast(true);
        }
    };

    const reviewSubmitHandler = async (e) => {
        e.preventDefault();
        if (!userInfo) {
            setToastMessage('Please log in to submit a review.');
            setToastType('error');
            setShowToast(true);
            return;
        }
        if (rating === 0) {
            setToastMessage('Please select a rating.');
            setToastType('error');
            setShowToast(true);
            return;
        }
        setReviewLoading(true);
        try {
            const reviewData = { rating, comment };
            await createProductReview(productId, reviewData, userInfo?.token);
            setToastMessage('Review submitted successfully!');
            setToastType('success');
            setRating(0);
            setComment('');
            const data = await getProductDetails(productId); // Refetch
            setProduct(data);
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to submit review.';
            setToastMessage(errorMessage);
            setToastType('error');
        } finally {
            setReviewLoading(false);
            setShowToast(true);
        }
    };

    // --- Render Logic ---

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-500 text-xl mt-8 p-4">{error}</div>;
    if (!product) return <div className="text-center text-gray-600 text-xl mt-8 p-4">Product not found.</div>;

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-6xl mx-auto my-8 dark:bg-gray-800">
                <Link to="/" className="inline-flex items-center text-primary hover:text-primary-dark mb-6 font-medium dark:text-primary-light dark:hover:text-primary">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Products
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Image Column */}
                    <div className="lg:col-span-2 flex justify-center items-start pt-4 md:pt-0 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-auto max-h-96 object-contain rounded-md"
                            onError={(e) => { e.target.onerror = null; e.target.src='/images/placeholder.png';}}
                        />
                    </div>

                    {/* Details Column */}
                    <div className="lg:col-span-3">
                        {/* --- ✅ FIXED SELLER INFO BLOCK --- */}
                        {product.user && (
                            <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                                {product.user.isAdmin ? (
                                    <span className="font-medium inline-flex items-center gap-1 text-gray-700 dark:text-gray-300">
                                        <ShieldCheck size={14} className="text-blue-500"/>
                                        Sold by LUXORA
                                    </span>
                                ) : product.user.isSeller ? (
                                    <>
                                        Sold by:{' '}
                                        <Link
                                            to={`/seller/${product.user._id}`}
                                            className="text-primary hover:underline font-medium inline-flex items-center gap-1 dark:text-primary-light dark:hover:text-primary"
                                        >
                                            <Store size={14} />
                                            {/* Show brandName if present, else fallback to name */}
                                            {product.user.seller?.brandName && product.user.seller.brandName.trim() !== ""
                                                ? product.user.seller.brandName
                                                : product.user.name}
                                        </Link>
                                    </>
                                ) : (
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        Sold by: {product.user.name}
                                    </span>
                                )}
                            </div>
                        )}
                        {/* --- END FIXED BLOCK --- */}

                        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-3">{product.name}</h1>

                        <div className="flex items-center mb-4">
                            <Rating value={product.rating} text={`(${product.numReviews} Reviews)`} />
                            {product.numReviews > 0 && (
                                <a href="#reviews" className="ml-3 text-sm font-medium text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary">
                                    See Reviews
                                </a>
                            )}
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg mb-4 leading-relaxed">{product.description}</p>

                        <div className="border-t border-b py-4 my-4 dark:border-gray-700">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <span className="text-3xl md:text-4xl font-bold text-primary dark:text-primary-light">{formatCurrency(product.price)}</span>
                                <div className="text-md md:text-lg">
                                    Status: {product.countInStock > 0 ?
                                        <span className="text-green-600 font-semibold dark:text-green-400">In Stock {product.countInStock < 10 && `(Only ${product.countInStock} left!)`}</span> :
                                        <span className="text-red-600 font-semibold dark:text-red-400">Out of Stock</span>
                                    }
                                </div>
                            </div>
                        </div>

                        {product.countInStock > 0 && (
                            <div className="flex items-center mb-6">
                                <label htmlFor="qty" className="mr-4 text-lg md:text-xl font-medium text-gray-700 dark:text-gray-300">Quantity:</label>
                                <select
                                    id="qty"
                                    value={qty}
                                    onChange={(e) => setQty(Number(e.target.value))}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                >
                                    {[...Array(Math.min(product.countInStock, 10)).keys()].map((x) => (
                                        <option key={x + 1} value={x + 1}>{x + 1}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex items-stretch gap-2 mt-6 flex-wrap">
                            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
                                <button onClick={handleAddToCart} disabled={product.countInStock === 0 || qty > product.countInStock} className="px-4 sm:px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold text-md sm:text-lg hover:bg-gray-300 transition disabled:opacity-50 flex items-center justify-center gap-2 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 disabled:cursor-not-allowed">
                                    <ShoppingCart className="w-5 h-5" /> Add to Cart
                                </button>
                                <button onClick={handleBuyNow} disabled={product.countInStock === 0 || qty > product.countInStock} className="px-4 sm:px-6 py-3 bg-primary text-white rounded-lg font-semibold text-md sm:text-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed">
                                    Buy Now
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => userInfo ? setIsWishlistModalOpen(true) : navigate(`/login?redirect=/product/${productId}`)} title="Add to Wishlist" className={`p-3 sm:p-4 rounded-lg border transition ${isInWishlist ? 'bg-red-50 text-red-500 border-red-200 dark:bg-red-900/50 dark:border-red-800' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'}`}>
                                    <Heart className="w-5 h-5 sm:w-6 sm:h-6" fill={isInWishlist ? 'currentColor' : 'none'} />
                                </button>
                                <button onClick={handleRecommend} title="Recommend/Share" className="p-3 sm:p-4 rounded-lg border bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 transition dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">
                                    <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>
                        </div>

                        {isInWishlist && (
                            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800/50">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-md md:text-lg text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5"/> My Wishlist Note
                                    </h4>
                                    {!isEditingNote && (
                                        <button onClick={() => setIsEditingNote(true)} className="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary p-1 rounded hover:bg-yellow-100 dark:hover:bg-yellow-800/30">
                                            <Edit3 className="w-4 h-4 md:w-5 md:h-5" />
                                        </button>
                                    )}
                                </div>
                                {isEditingNote ? (
                                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                                        <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="flex-grow p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="e.g., Need size Medium"/>
                                        <button onClick={handleNoteSave} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg text-sm">Save</button>
                                        <button onClick={() => setIsEditingNote(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 font-semibold rounded-lg text-sm">Cancel</button>
                                    </div>
                                ) : (
                                    <p className="mt-1 text-gray-700 dark:text-gray-300 italic text-sm md:text-base">
                                        {note || "No note added yet. Click the edit icon to add one."}
                                    </p>
                                )}
                            </div>
                        )}
                    </div> {/* End Details Column */}
                </div> {/* End Main Product Grid */}

                {/* --- Reviews Section --- */}
                <div id="reviews" className="mt-12 pt-8 border-t dark:border-gray-700">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 dark:text-gray-100">Customer Reviews</h2>
                    {/* Display Existing Reviews */}
                    {product.reviews && product.reviews.length > 0 ? (
                        <div className="space-y-8">
                            {product.reviews.map((review) => (
                                <div key={review._id} className="p-4 border-b dark:border-gray-700 last:border-b-0">
                                    <div className="flex flex-wrap items-center mb-2 gap-x-4 gap-y-1">
                                        <strong className="text-gray-800 dark:text-gray-100">{review.name}</strong>
                                        <Rating value={review.rating} />
                                        <span className="text-gray-500 dark:text-gray-400 text-sm">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-600 dark:bg-gray-700/50 dark:text-gray-400">No reviews yet for this product.</div>
                    )}

                    {/* Write Review Form */}
                    <div className="mt-10 p-6 bg-gray-50 rounded-lg dark:bg-gray-700/50">
                        <h3 className="text-xl md:text-2xl font-bold mb-4 dark:text-gray-100">Write a Review</h3>
                        {userInfo ? (
                            product.reviews?.some(r => r.user.toString() === userInfo._id.toString()) ? (
                                <div className="p-4 bg-green-100 rounded-lg text-green-800 dark:bg-green-900/50 dark:text-green-300">
                                    You have already reviewed this product.
                                </div>
                            ) : (
                                <form onSubmit={reviewSubmitHandler} className="space-y-4">
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <label htmlFor="rating-select" className="font-medium dark:text-gray-200">Your Rating:</label>
                                        <select id="rating-select" value={rating} onChange={(e) => setRating(Number(e.target.value))} className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white" required>
                                            <option value={0} disabled>Select...</option>
                                            <option value={5}>5 Stars - Excellent</option>
                                            <option value={4}>4 Stars - Good</option>
                                            <option value={3}>3 Stars - Average</option>
                                            <option value={2}>2 Stars - Fair</option>
                                            <option value={1}>1 Star - Poor</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="comment-textarea" className="font-medium dark:text-gray-200 block mb-1">Your Comment:</label>
                                        <textarea id="comment-textarea" value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white" rows={4} required placeholder="Share your thoughts on the product..."/>
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="submit" disabled={reviewLoading} className="px-4 py-2 bg-primary text-white rounded font-semibold hover:bg-primary-dark transition disabled:opacity-50">
                                            {reviewLoading ? <LoadingSpinner size="sm" /> : 'Submit Review'}
                                        </button>
                                        <button type="button" onClick={() => { setRating(0); setComment(''); }} className="px-4 py-2 bg-gray-200 rounded dark:bg-gray-600 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition">
                                            Reset
                                        </button>
                                    </div>
                                </form>
                            )
                        ) : (
                            <div className="p-4 bg-blue-100 rounded-lg text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                Please <Link to={`/login?redirect=/product/${productId}`} className="font-bold underline">sign in</Link> to write a review.
                            </div>
                        )}
                    </div>
                </div>{/* End Reviews Section */}
            </div>{/* End Main Container */}

            {/* Related Products Section */}
            {relatedProducts && relatedProducts.length > 0 && (
                <section className="max-w-6xl mx-auto my-12 px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">
                        You Might Also Like
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {relatedProducts.map((relatedProduct) => (
                            <ProductCard key={relatedProduct._id} product={relatedProduct} />
                        ))}
                    </div>
                </section>
            )}

            {/* Modals and Toasts */}
            {showToast && <NotificationToast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}
            {isWishlistModalOpen && userInfo && product && (
                <AddToWishlistModal
                    product={product}
                    onClose={() => setIsWishlistModalOpen(false)}
                    productInWishlists={productInWishlistIds}
                />
            )}
        </>
    );
};

export default ProductPage;
