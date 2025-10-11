import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductDetails, createProductReview, getRelatedProducts } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import NotificationToast from '../components/common/NotificationToast';
import AddToWishlistModal from '../components/wishlist/AddToWishlistModal';
import ProductCard from '../components/products/ProductCard';
import { ShoppingCart, Heart, ArrowLeft, Star, Send, Edit3, MessageSquare } from 'lucide-react';

// Helper Components
const getUserInfo = () => {
    try {
        return JSON.parse(localStorage.getItem('userInfo'));
    } catch (error) { return null; }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

const Rating = ({ value }) => {
    return (
      <div className="flex text-yellow-500">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-5 h-5 ${i < Math.round(value) ? 'fill-current' : 'text-gray-300'}`} />
        ))}
      </div>
    );
};

// Main Component
const ProductPage = () => {
    const { id: productId } = useParams();
    const navigate = useNavigate();
    
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qty, setQty] = useState(1);
    
    const { addItem: addItemToCart, error: cartError } = useCart();
    const { wishlists, setWishlist } = useWishlist();

    const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('info');

    const [note, setNote] = useState('');
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [mediaFiles, setMediaFiles] = useState([]);
    // keep only setter to avoid unused variable warning
    const [, setReviewLoading] = useState(false);

    const userInfo = getUserInfo();

    const wishlistItem = wishlists?.find(list => list.items.some(item => item.product?._id === product?._id))
        ?.items.find(item => item.product?._id === product?._id);

    const isInWishlist = !!wishlistItem;

    const productInWishlists = wishlists
        ?.filter(list => list.items.some(item => item.product?._id === product?._id))
        .map(list => list._id) || [];

    useEffect(() => {
        if (wishlistItem) {
            setNote(wishlistItem.notes || '');
        }
    }, [wishlistItem]);

    useEffect(() => {
        const fetchProductData = async () => {
            window.scrollTo(0, 0);
            try {
                setLoading(true);
                const [productData, relatedData] = await Promise.all([
                    getProductDetails(productId),
                    getRelatedProducts(productId)
                ]);
                setProduct(productData);
                setRelatedProducts(relatedData);
            } catch (err) {
                setError(err?.message || 'Failed to fetch product data');
            } finally {
                setLoading(false);
            }
        };
        fetchProductData();
    }, [productId]);

    const handleAddToCart = async () => {
        if (!product || product.countInStock === 0) return;
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
        if (!product || product.countInStock === 0) return;
        try {
            await addItemToCart(product._id, qty);
            navigate('/checkout');
        } catch (error) {
            setToastMessage(cartError || 'Failed to add to cart.');
            setToastType('error');
            setShowToast(true);
        }
    };

    const handleRecommend = async () => {
        const shareData = {
            title: product.name,
            text: `Check out this amazing product: ${product.name}`,
            url: window.location.href
        };
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) { console.error("Share failed:", err); }
        } else {
            try {
                await navigator.clipboard.writeText(shareData.url);
                setToastMessage('Product link copied to clipboard!');
                setToastType('success');
                setShowToast(true);
            } catch (err) {
                setToastMessage('Failed to copy link.');
                setToastType('error');
                setShowToast(true);
            }
        }
    };

    const handleNoteSave = async () => {
        try {
            const parentWishlist = wishlists.find(w => w.items.some(i => i._id === wishlistItem._id));
            if (parentWishlist && wishlistItem) {
                const updatedWishlist = await addNoteToWishlist(parentWishlist._id, wishlistItem._id, note);
                // update context with returned updated wishlist
                if (updatedWishlist) {
                  setWishlist(current => current.map(w => w._id === updatedWishlist._id ? updatedWishlist : w));
                }
                setIsEditingNote(false);
                setToastMessage('Note saved successfully!');
                setToastType('success');
                setShowToast(true);
            } else {
                throw new Error("Could not find wishlist for this item.");
            }
        } catch (err) {
            setToastMessage('Failed to save note.');
            setToastType('error');
            setShowToast(true);
        }
    };

    // Accept wishlistId, wishlistItemId, noteContent and return updated wishlist (optimistic)
    const addNoteToWishlist = async (wishlistId, wishlistItemId, noteContent) => {
      try {
        const currentList = Array.isArray(wishlists) ? wishlists : [];
        const target = currentList.find(w => w._id === wishlistId);
        if (!target) return null;

        const updatedItems = target.items.map(item => {
          if (item._id === wishlistItemId) {
            return { ...item, notes: noteContent };
          }
          return item;
        });
        const updatedWishlist = { ...target, items: updatedItems };

        // optimistic update of context
        if (typeof setWishlist === 'function') {
          setWishlist(prev => prev?.map(w => (w._id === wishlistId ? updatedWishlist : w)) ?? prev);
        }

        setToastMessage('Note saved.');
        setToastType('success');
        setShowToast(true);

        return updatedWishlist;
      } catch (err) {
        console.error('Failed to save wishlist note', err);
        setToastMessage('Failed to save note.');
        setToastType('error');
        setShowToast(true);
        return null;
      }
    };

    const handleFileChange = (e) => {
        if (!e.target.files) return;
        if (e.target.files.length > 5) {
            setToastMessage('You can upload a maximum of 5 files.');
            setToastType('error');
            setShowToast(true);
            e.target.value = null;
            return;
        }
        setMediaFiles(Array.from(e.target.files));
    };

    const reviewSubmitHandler = async (e) => {
        e.preventDefault();
        if (!userInfo) return;
        setReviewLoading(true);
        try {
            // build FormData if createProductReview expects files
            const reviewData = { rating, comment, media: mediaFiles };
            // If your service expects token separately, adjust accordingly.
            await createProductReview(productId, reviewData, userInfo?.token);
            setToastMessage('Review submitted successfully!');
            setToastType('success');
            setShowToast(true);
            setRating(0);
            setComment('');
            setMediaFiles([]);
            // Re-fetch product to show new review
            const data = await getProductDetails(productId);
            setProduct(data);
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to submit review.';
            setToastMessage(errorMessage);
            setToastType('error');
            setShowToast(true);
        } finally {
            setReviewLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-500 text-xl mt-8">{error}</div>;
    if (!product) return <div className="text-center text-gray-600 text-xl mt-8">Product not found.</div>;

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-6xl mx-auto my-8 dark:bg-gray-800">
                <Link to="/" className="inline-flex items-center text-primary hover:text-primary-dark mb-6 font-medium">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Products
                </Link>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-2 flex justify-center items-center">
                        <img src={product.image} alt={product.name} className="w-full h-auto max-h-96 object-contain rounded-lg"/>
                    </div>
                    <div className="lg:col-span-3">
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-3">{product.name}</h1>
                        <div className="flex items-center mb-4">
                            <Rating value={product.rating} />
                            <a href="#reviews" className="ml-3 text-sm font-medium text-primary hover:text-primary-dark">({product.numReviews} Reviews)</a>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-lg mb-4 leading-relaxed">{product.description}</p>
                        <div className="border-t border-b py-4 my-4 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <span className="text-4xl font-bold text-primary">{formatCurrency(product.price)}</span>
                                <div className="text-lg">
                                    Status: {product.countInStock > 0 ? 
                                        <span className="text-green-600 font-semibold">In Stock</span> : 
                                        <span className="text-red-600 font-semibold">Out of Stock</span>
                                    }
                                </div>
                            </div>
                        </div>
                        {product.countInStock > 0 && (
                            <div className="flex items-center mb-6">
                                <label htmlFor="qty" className="mr-4 text-xl font-medium text-gray-700 dark:text-gray-300">Quantity:</label>
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
                        
                        <div className="flex items-stretch gap-2 mt-6">
                            <div className="flex-grow grid grid-cols-2 gap-2">
                                <button onClick={handleAddToCart} disabled={product.countInStock === 0} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold text-lg hover:bg-gray-300 transition disabled:opacity-50 flex items-center justify-center gap-2 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                                    <ShoppingCart className="w-5 h-5" /> Add to Cart
                                </button>
                                <button onClick={handleBuyNow} disabled={product.countInStock === 0} className="px-6 py-3 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary-dark transition disabled:opacity-50">
                                    Buy Now
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setIsWishlistModalOpen(true)} title="Add to Wishlist" className={`p-4 rounded-lg border transition ${isInWishlist ? 'bg-red-50 text-red-500 border-red-200 dark:bg-red-900/50 dark:border-red-800' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'}`}>
                                    <Heart className="w-6 h-6" fill={isInWishlist ? 'currentColor' : 'none'} />
                                </button>
                                <button onClick={handleRecommend} title="Recommend to a Friend" className="p-4 rounded-lg border bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 transition dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600">
                                    <Send className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {isInWishlist && (
                          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800/50">
                            <div className="flex justify-between items-center">
                              <h4 className="font-semibold text-lg text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5"/> My Wishlist Note
                              </h4>
                              {!isEditingNote && (
                                <button onClick={() => setIsEditingNote(true)} className="text-primary hover:text-primary-dark">
                                  <Edit3 className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                            {isEditingNote ? (
                              <div className="mt-2 flex items-center gap-2">
                                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="flex-grow p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600" placeholder="e.g., Need size Medium"/>
                                <button onClick={handleNoteSave} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg">Save</button>
                                <button onClick={() => setIsEditingNote(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 font-semibold rounded-lg">Cancel</button>
                              </div>
                            ) : (
                              <p className="mt-2 text-gray-700 dark:text-gray-300 italic">
                                {note || "No note added yet. Click the edit icon to add one."}
                              </p>
                            )}
                          </div>
                        )}
                    </div>
                </div>

                <div id="reviews" className="mt-12 pt-8 border-t dark:border-gray-700">
                    <h2 className="text-3xl font-bold mb-6 dark:text-gray-100">Customer Reviews</h2>
                    {product.reviews.length === 0 ? (
                        <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-600 dark:bg-gray-700/50 dark:text-gray-400">No reviews yet for this product.</div>
                    ) : (
                        <div className="space-y-8">
                            {product.reviews.map((review) => (
                                <div key={review._id} className="p-4 border-b dark:border-gray-700">
                                    <div className="flex items-center mb-2">
                                        <strong className="mr-4 text-gray-800 dark:text-gray-100">{review.name}</strong>
                                        <Rating value={review.rating} />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                                    <div className="mt-4 flex gap-4 flex-wrap">
                                        {review.images && review.images.map((img, index) => (
                                            <a href={img} target="_blank" rel="noopener noreferrer" key={index}>
                                                <img src={img} alt={`review-img-${index}`} className="w-24 h-24 object-cover rounded-md border hover:opacity-80 transition dark:border-gray-600"/>
                                            </a>
                                        ))}
                                        {review.videos && review.videos.map((vid, index) => (
                                            <video key={index} src={vid} controls className="w-48 h-auto rounded-md border dark:border-gray-600"/>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-10 p-6 bg-gray-50 rounded-lg dark:bg-gray-700/50">
                        <h3 className="text-2xl font-bold mb-4 dark:text-gray-100">Write a Review</h3>
                        {userInfo ? (
                            <form onSubmit={reviewSubmitHandler} className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <label className="font-medium">Rating</label>
                                    <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="p-2 border rounded">
                                        <option value={0}>Select</option>
                                        {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} Star{v>1?'s':''}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="font-medium">Comment</label>
                                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-2 border rounded" rows={4} />
                                </div>
                                <div>
                                    <label className="font-medium">Upload images / videos (max 5)</label>
                                    <input type="file" accept="image/*,video/*" multiple onChange={handleFileChange} className="mt-2" />
                                    {mediaFiles.length > 0 && (
                                        <p className="text-sm text-gray-600 mt-2">{mediaFiles.length} file(s) selected</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Submit Review</button>
                                    <button type="button" onClick={() => { setRating(0); setComment(''); setMediaFiles([]); }} className="px-4 py-2 bg-gray-200 rounded">Reset</button>
                                </div>
                            </form>
                        ) : (
                            <div className="p-4 bg-blue-100 rounded-lg text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                Please <Link to="/login" className="font-bold underline">sign in</Link> to write a review.
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {relatedProducts.length > 0 && (
                <section className="max-w-6xl mx-auto my-12">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">
                        You Might Also Like
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {relatedProducts.map((relatedProduct) => (
                            <ProductCard key={relatedProduct._id} product={relatedProduct} />
                        ))}
                    </div>
                </section>
            )}

            {showToast && <NotificationToast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}
            {isWishlistModalOpen && (
                <AddToWishlistModal 
                    product={product} 
                    onClose={() => setIsWishlistModalOpen(false)} 
                    productInWishlists={productInWishlists}
                />
            )}
        </>
    );
};

export default ProductPage;