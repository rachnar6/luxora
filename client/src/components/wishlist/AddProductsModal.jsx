import React, { useState } from 'react';
import { useProducts } from '../../contexts/ProductContext';
import { useWishlist } from '../../contexts/WishlistContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { Search, Plus, X } from 'lucide-react';

const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(value);
};

const AddProductsModal = ({ wishlist, onClose }) => {
    // Get the global list of all products from the ProductContext
    const { products, loading: productsLoading } = useProducts();
    const { addItem } = useWishlist();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(null); // Tracks loading state for each button

    // This filter will now work correctly because `products` is a valid array
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddItem = async (productId) => {
        setIsAdding(productId);
        try {
            await addItem(wishlist._id, productId);
            // The item will now appear as "Added" in the modal automatically
        } catch (error) {
            console.error("Failed to add item to wishlist:", error);
            // You can add a toast notification for errors here
        } finally {
            setIsAdding(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 pb-4 border-b dark:border-gray-700">
                    <h3 className="text-xl font-semibold dark:text-white">Add Products to "{wishlist.name}"</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                        <X />
                    </button>
                </div>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search all products..."
                        className="w-full py-2 pl-10 pr-4 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                    {productsLoading ? <LoadingSpinner /> : (
                        <div className="space-y-3">
                            {filteredProducts.map(product => {
                                // Check if the product is already in the specific wishlist we are viewing
                                const isInThisWishlist = wishlist.items.some(item => item.product?._id === product._id);
                                return (
                                    <div key={product._id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
                                        <div className="flex-grow">
                                            <p className="font-semibold dark:text-gray-200">{product.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(product.price)}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAddItem(product._id)}
                                            disabled={isInThisWishlist || isAdding === product._id}
                                            className="px-3 py-1 text-sm font-semibold rounded-full flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-primary/10 text-primary hover:bg-primary/20"
                                        >
                                            {isAdding === product._id ? <LoadingSpinner size="small" /> : <Plus size={16} />}
                                            {isInThisWishlist ? 'Added' : 'Add'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddProductsModal;

