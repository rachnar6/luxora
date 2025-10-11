import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getProductDetails, updateProduct } from '../../services/productService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Edit } from 'lucide-react';

const ProductEditPage = () => {
    const { id: productId } = useParams(); // Get the product ID from the URL
    const navigate = useNavigate();
    const { token } = useAuth();

    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [image, setImage] = useState('');
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState(0);
    const [description, setDescription] = useState('');
    
    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch the product's current details when the page loads
    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const data = await getProductDetails(productId);
                setName(data.name);
                setPrice(data.price);
                setImage(data.image);
                setBrand(data.brand);
                setCategory(data.category);
                setCountInStock(data.countInStock);
                setDescription(data.description);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch product details.');
                setLoading(false);
            }
        };
        fetchProductDetails();
    }, [productId]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            const updatedData = { name, price, image, brand, category, countInStock, description };
            await updateProduct(productId, updatedData, token);
            // Navigate back to the seller's product list after a successful update
            navigate('/seller/productlist');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update product.');
            setUpdateLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error && !updateLoading) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <div className="bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                    <Edit className="mr-3 text-primary" size={32} />
                    Edit Product
                </h1>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
                <form onSubmit={submitHandler} className="space-y-4">
                    {/* Form fields are pre-populated with the product's current data */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                    </div>
                     <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                        <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image URL</label>
                        <input type="text" id="image" value={image} onChange={(e) => setImage(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
                        <input type="text" id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                        <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="countInStock" className="block text-sm font-medium text-gray-700">Count In Stock</label>
                        <input type="number" id="countInStock" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows="4" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                    </div>
                    <div>
                        <button type="submit" disabled={updateLoading} className="w-full flex justify-center py-3 px-4 rounded-md shadow-sm text-lg font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50">
                            {updateLoading ? <LoadingSpinner size="sm" /> : 'Update Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductEditPage;