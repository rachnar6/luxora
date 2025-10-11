import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 1. IMPORT useNavigate
import { useAuth } from '../../contexts/AuthContext';
// 2. IMPORT deleteProduct
import { getMyProducts, deleteProduct } from '../../services/productService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Package, Edit, Trash2, PlusCircle } from 'lucide-react';

const MyProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();
    const navigate = useNavigate(); // 3. INITIALIZE useNavigate

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getMyProducts(token);
                setProducts(data);
            } catch (err) {
                setError('Failed to fetch products.');
            } finally {
                setLoading(false);
            }
        };
        if (token) {
            fetchProducts();
        }
    }, [token]);

    // 4. ADD THE DELETE HANDLER FUNCTION
    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(productId, token);
                // Refresh the product list by filtering out the deleted product
                setProducts(products.filter(p => p._id !== productId));
            } catch (err) {
                alert('Failed to delete product.');
            }
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <Package className="mr-3 text-primary" size={32} />
                    My Products
                </h1>
                <Link to="/seller/product/create" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark flex items-center transition-colors">
                    <PlusCircle className="mr-2" size={20} />
                    Create Product
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {products.length > 0 ? products.map((product) => (
                            <tr key={product._id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">${product.price.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center space-x-4">
                                    {/* 5. CONNECT THE BUTTONS TO THEIR ACTIONS */}
                                    <button onClick={() => navigate(`/seller/product/${product._id}/edit`)} className="text-indigo-600 hover:text-indigo-900" title="Edit">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900" title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-gray-500">You have not created any products yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyProductsPage;