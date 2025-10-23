// src/pages/seller/SellerProfilePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getSellerProfile, updateSellerProfile } from '../../services/userService';
import { getMyProducts, deleteProduct } from '../../services/productService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NotificationToast from '../../components/common/NotificationToast';
import { Briefcase, Mail, Instagram, Facebook, Twitter, Edit, Trash2, PlusCircle, Save, XCircle, ExternalLink } from 'lucide-react';
// Import the report section component
import SellerReportSection from '../../components/seller/SellerReportSection'; // Make sure this path is correct

// Helper to format currency
const formatCurrency = (value) => {
    const numericValue = Number(value);
    if (isNaN(numericValue)) return '₹0.00';
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(numericValue);
};

const SellerProfilePage = () => {
    const { user, setUser, token } = useAuth(); // Assuming token might be needed if API instance doesn't handle it
    const navigate = useNavigate();

    // --- State ---
    const [originalProfile, setOriginalProfile] = useState(null);
    const [brandName, setBrandName] = useState('');
    const [bio, setBio] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [instagram, setInstagram] = useState('');
    const [facebook, setFacebook] = useState('');
    const [twitter, setTwitter] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingDelete, setLoadingDelete] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
    const [myProducts, setMyProducts] = useState([]);
    const [productError, setProductError] = useState(null);

    // --- Fetch Seller Profile ---
    const fetchProfile = useCallback(async () => {
        try {
            setLoadingProfile(true);
            // Pass token if your service requires it explicitly
            const data = await getSellerProfile(/* token */);
            setOriginalProfile(data);
            setBrandName(data.seller?.brandName || '');
            setBio(data.seller?.bio || '');
            setContactEmail(data.seller?.contactEmail || '');
            setInstagram(data.seller?.socialMedia?.instagram || '');
            setFacebook(data.seller?.socialMedia?.facebook || '');
            setTwitter(data.seller?.socialMedia?.twitter || '');
        } catch (error) {
            console.error("Fetch profile error:", error);
            setToast({ show: true, message: error.response?.data?.message || 'Failed to load profile', type: 'error' });
        } finally {
            setLoadingProfile(false);
        }
    }, [/* token */]); // Add token dependency if needed

    // --- Fetch Seller Products ---
     const fetchMyProducts = useCallback(async () => {
        try {
            setLoadingProducts(true);
            setProductError(null);
            // Pass token if your service requires it explicitly
            const data = await getMyProducts(/* token */);
            setMyProducts(data);
        } catch (error) {
            console.error("Fetch products error:", error);
            const errMsg = error.response?.data?.message || 'Failed to load your products';
            setProductError(errMsg);
        } finally {
            setLoadingProducts(false);
        }
    }, [/* token */]); // Add token dependency if needed

    // --- Initial Data Fetch ---
    useEffect(() => {
        fetchProfile();
        fetchMyProducts();
    }, [fetchProfile, fetchMyProducts]);

    // --- Handlers ---
    const handleEditToggle = () => {
        if (isEditing && originalProfile) {
            // Reset fields to original values on cancel
            setBrandName(originalProfile.seller?.brandName || '');
            setBio(originalProfile.seller?.bio || '');
            setContactEmail(originalProfile.seller?.contactEmail || '');
            setInstagram(originalProfile.seller?.socialMedia?.instagram || '');
            setFacebook(originalProfile.seller?.socialMedia?.facebook || '');
            setTwitter(originalProfile.seller?.socialMedia?.twitter || '');
        }
        setIsEditing(!isEditing);
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        if (!brandName.trim()) {
            setToast({ show: true, message: 'Brand Name is required.', type: 'error' });
            return;
        }
        setLoadingUpdate(true);
        try {
            const profileData = {
                brandName,
                bio,
                contactEmail,
                socialMedia: { instagram, facebook, twitter }
            };
            // Pass token if your service requires it explicitly
            const updatedUser = await updateSellerProfile(profileData /*, token */);
            setUser(updatedUser);
            setOriginalProfile(updatedUser);
            setIsEditing(false);
            setToast({ show: true, message: 'Profile updated successfully!', type: 'success' });
        } catch (error) {
            console.error("Update profile error:", error);
            setToast({ show: true, message: error.response?.data?.message || 'Update failed', type: 'error' });
        } finally {
            setLoadingUpdate(false);
        }
    };

     const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product? This cannot be undone.')) {
            setLoadingDelete(productId);
            try {
                // Pass token if your service requires it explicitly
                await deleteProduct(productId /*, token */);
                setToast({ show: true, message: 'Product deleted successfully!', type: 'success' });
                fetchMyProducts(); // Refetch products
            } catch (error) {
                console.error("Delete product error:", error);
                setToast({ show: true, message: error.response?.data?.message || 'Failed to delete product', type: 'error' });
            } finally {
                setLoadingDelete(null);
            }
        }
    };

    // --- Render ---
    if (loadingProfile) return <LoadingSpinner />;

    // Use default objects if originalProfile or sub-objects are null/undefined initially
    const sellerData = originalProfile?.seller || {};
    const socialMedia = sellerData.socialMedia || {};

    return (
        <>
            {/* --- Profile Section --- */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto my-8 dark:bg-gray-800">
                <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                     <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100">
                         Seller Profile
                     </h1>
                     <button
                        onClick={handleEditToggle}
                        className={`py-2 px-4 rounded-lg font-semibold flex items-center gap-2 transition text-sm ${
                            isEditing
                                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900'
                        }`}
                    >
                         {isEditing ? <><XCircle size={16} /> Cancel</> : <><Edit size={16} /> Edit Profile</>}
                     </button>
                 </div>

                 {/* --- Display Mode --- */}
                 {!isEditing ? (
                     <div className="space-y-6">
                         {/* Brand Name */}
                         <div className="flex items-start gap-3">
                             <Briefcase className="text-primary dark:text-primary-light mt-1 flex-shrink-0" size={20} />
                             <div>
                                 <p className="text-sm text-gray-500 dark:text-gray-400">Brand Name</p>
                                 <p className="text-lg font-semibold dark:text-gray-100">{sellerData.brandName || <span className="italic text-gray-400">Not Set</span>}</p>
                             </div>
                         </div>
                         {/* Bio */}
                         <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">About Your Brand</p>
                              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{sellerData.bio || <span className="italic text-gray-400">No bio provided.</span>}</p>
                          </div>
                          {/* Contact Email */}
                         <div className="flex items-start gap-3">
                              <Mail className="text-primary dark:text-primary-light mt-1 flex-shrink-0" size={18}/>
                              <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Public Contact Email</p>
                                  <p className="dark:text-gray-100 break-all">{sellerData.contactEmail || <span className="italic text-gray-400">Not Set</span>}</p>
                              </div>
                          </div>
                          {/* Social Media */}
                          <div>
                             <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Social Media</p>
                             <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
                                 {socialMedia.instagram ? (
                                     <a href={socialMedia.instagram.startsWith('http') ? socialMedia.instagram : `https://${socialMedia.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-600 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400 text-sm">
                                         <Instagram size={16} /> Instagram <ExternalLink size={12} className="ml-0.5"/>
                                     </a>
                                 ) : null}
                                 {socialMedia.facebook ? (
                                      <a href={socialMedia.facebook.startsWith('http') ? socialMedia.facebook : `https://${socialMedia.facebook}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-600 hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-500 text-sm">
                                          <Facebook size={16} /> Facebook <ExternalLink size={12} className="ml-0.5"/>
                                      </a>
                                 ) : null}
                                 {socialMedia.twitter ? (
                                     <a href={socialMedia.twitter.startsWith('http') ? socialMedia.twitter : `https://${socialMedia.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-600 hover:text-sky-600 dark:text-gray-400 dark:hover:text-sky-400 text-sm">
                                         <Twitter size={16} /> Twitter <ExternalLink size={12} className="ml-0.5"/>
                                     </a>
                                 ) : null}
                                 {!socialMedia.instagram && !socialMedia.facebook && !socialMedia.twitter && (
                                     <p className="text-gray-500 dark:text-gray-400 text-sm italic">No social media links provided.</p>
                                 )}
                             </div>
                         </div>
                     </div>
                 ) : (
                 /* --- Edit Mode Form --- */
                     <form onSubmit={handleProfileSubmit} className="space-y-6 mt-6">
                         {/* Brand Name Input */}
                         <div>
                             <label htmlFor="brandName" className="block text-sm font-medium mb-1 dark:text-gray-300">Brand Name <span className="text-red-500">*</span></label>
                             <div className="relative mt-1">
                                 <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                 <input type="text" id="brandName" value={brandName} onChange={(e) => setBrandName(e.target.value)} required className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-primary focus:border-primary text-sm"/>
                             </div>
                         </div>
                         {/* Bio Textarea */}
                         <div>
                              <label htmlFor="bio" className="block text-sm font-medium mb-1 dark:text-gray-300">About Your Brand</label>
                              <textarea id="bio" rows="5" value={bio} onChange={(e) => setBio(e.target.value)} className="w-full p-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-primary focus:border-primary text-sm"/>
                          </div>
                          {/* Contact Email Input */}
                          <div>
                              <label htmlFor="contactEmail" className="block text-sm font-medium mb-1 dark:text-gray-300">Public Contact Email</label>
                              <div className="relative mt-1">
                                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                 <input type="email" id="contactEmail" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-primary focus:border-primary text-sm"/>
                              </div>
                          </div>
                          {/* Social Media Inputs */}
                          <div>
                              <label htmlFor="instagram" className="block text-sm font-medium mb-1 dark:text-gray-300">Instagram URL</label>
                              <div className="relative mt-1">
                                 <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                 <input type="text" id="instagram" placeholder="e.g., https://instagram.com/yourhandle" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-primary focus:border-primary text-sm"/>
                              </div>
                          </div>
                          <div>
                              <label htmlFor="facebook" className="block text-sm font-medium mb-1 dark:text-gray-300">Facebook URL</label>
                              <div className="relative mt-1">
                                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                  <input type="text" id="facebook" placeholder="e.g., https://facebook.com/yourpage" value={facebook} onChange={(e) => setFacebook(e.target.value)} className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-primary focus:border-primary text-sm"/>
                              </div>
                          </div>
                          <div>
                              <label htmlFor="twitter" className="block text-sm font-medium mb-1 dark:text-gray-300">Twitter URL</label>
                              <div className="relative mt-1">
                                 <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                 <input type="text" id="twitter" placeholder="e.g., https://twitter.com/yourhandle" value={twitter} onChange={(e) => setTwitter(e.target.value)} className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-primary focus:border-primary text-sm"/>
                              </div>
                          </div>
                          {/* Submit Button */}
                          <button type="submit" disabled={loadingUpdate} className="bg-primary text-white py-2 px-5 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                             {loadingUpdate ? <LoadingSpinner size="xs" /> : <><Save size={16}/> Save Changes</>}
                          </button>
                     </form>
                 )}
            </div>

            {/* --- Render Seller Report Section --- */}
            <SellerReportSection />

            {/* --- My Products Section --- */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-6xl mx-auto my-8 dark:bg-gray-800">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                     <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                         My Products
                     </h2>
                     <Link
                        to="/seller/product/create"
                        className="bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2 text-sm"
                    >
                         <PlusCircle size={16} /> Create New Product
                     </Link>
                 </div>

                 {loadingProducts ? ( <LoadingSpinner /> )
                  : productError ? ( <div className="text-center text-red-500 bg-red-100 p-4 rounded dark:bg-red-900/30">{productError}</div> )
                  : myProducts.length === 0 ? ( <p className="text-center text-gray-500 dark:text-gray-400 py-6 italic">You haven't added any products yet.</p> )
                  : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                         {myProducts.map((product) => (
                             <div key={product._id} className="border rounded-lg p-4 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex flex-col justify-between hover:shadow-md transition-shadow">
                                 {/* Product Info */}
                                 <Link to={`/product/${product._id}`} className="flex flex-col flex-grow mb-3 group"> {/* Added group for potential hover effects */}
                                     <div className="w-full h-40 mb-3 overflow-hidden rounded flex-shrink-0 bg-gray-200 dark:bg-gray-600">
                                        <img
                                            src={product.image || '/images/placeholder.png'}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" // Added hover effect
                                            onError={(e) => { e.target.onerror = null; e.target.src='/images/placeholder.png';}}
                                        />
                                     </div>
                                     <h3 className="font-semibold text-lg mb-1 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-primary-light transition-colors line-clamp-2 flex-grow" title={product.name}>{product.name}</h3>
                                     <p className="text-primary font-bold mb-1 dark:text-primary-light">{formatCurrency(product.price)}</p>
                                     <p className="text-sm text-gray-600 dark:text-gray-400">
                                         Stock: {product.countInStock > 0 ? product.countInStock : <span className='text-red-500 font-medium'>Out</span>}
                                     </p>
                                 </Link>

                                 {/* Action Buttons */}
                                 <div className="mt-auto flex justify-between items-center gap-2 border-t pt-3 dark:border-gray-600">
                                     <Link
                                        to={`/seller/product/${product._id}/edit`}
                                        className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1 py-1 px-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                        title="Edit Product"
                                    >
                                         <Edit size={12} /> Edit
                                     </Link>
                                     <button
                                        onClick={() => handleDeleteProduct(product._id)}
                                        disabled={loadingDelete === product._id}
                                        className="text-xs sm:text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium flex items-center gap-1 py-1 px-2 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                                        title="Delete Product"
                                    >
                                         {loadingDelete === product._id ? (
                                              <LoadingSpinner size="xs" />
                                         ) : (
                                             <><Trash2 size={12} /> Delete</>
                                         )}
                                     </button>
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
            </div>

            {/* Toast Notifications */}
            {toast.show && <NotificationToast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
        </>
    );
};

export default SellerProfilePage;