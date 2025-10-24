import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductsBySeller } from '../../services/productService'; // Make sure this path is correct
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Package } from 'lucide-react';

const ProductsBySellerPage = () => {
    const { id: sellerId } = useParams(); // Get seller ID from the URL
    const [products, setProducts] = useState([]); // Default state is an empty array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProductsBySeller(sellerId);
                // Ensure the data is an array before setting state
                if (Array.isArray(data)) {
                    setProducts(data);
                } else {
                    // If API returns null/undefined, set an empty array to prevent map error
                    setProducts([]); 
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch products.');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [sellerId]);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center mb-6">
                <Package className="mr-3 text-indigo-600" size={32} />
                Products by Seller
            </h1>
            <p className="mb-4 text-gray-500">Seller ID: {sellerId}</p>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {/* --- THIS IS THE FIX ---
                              Check if the array has items before mapping.
                              If not, show a "No products" message.
                            */}
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <tr key={product._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{product._id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{product.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">${product.price}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                                        No products found for this seller.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductsBySellerPage;