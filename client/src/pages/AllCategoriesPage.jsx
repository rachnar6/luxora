// src/pages/AllCategoriesPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, List } from 'lucide-react';
import { getUniqueCategories } from '../services/productService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import NotificationToast from '../components/common/NotificationToast';

const AllCategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('info');

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getUniqueCategories();
                setCategories(data);
            } catch (err) {
                console.error("Error fetching all categories:", err.response ? err.response.data : err.message);
                const message = err.response?.data?.message || 'Failed to fetch categories';
                setError(message);
                setToastMessage(message);
                setToastType('error');
                setShowToast(true);
            } finally {
                 setLoading(false);
            }
        };
        fetchCategories();
    }, []); // Empty dependency array means this runs once on mount

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto my-8 dark:bg-gray-800">
            <Link to="/" className="inline-flex items-center text-primary hover:text-primary-dark mb-6 font-medium dark:text-primary-light dark:hover:text-primary">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
            </Link>

            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center flex items-center justify-center gap-3 dark:text-gray-100">
                <List className="w-8 h-8 text-primary" /> All Categories
            </h1>

            {error && !showToast ? (
                <div className="text-center text-red-500 text-xl mt-8">{error}</div>
            ) : categories.length === 0 ? (
                <div className="text-center text-gray-600 text-xl mt-8 dark:text-gray-400">No categories found.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categories.map((cat) => (
                        <Link
                            key={cat}
                            // Correct link pointing to AllProductsPage with filter
                            to={`/products?category=${encodeURIComponent(cat)}`}
                            className="bg-gray-50 rounded-xl shadow-md p-4 text-center hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center dark:bg-gray-700"
                        >
                            {/* Simple placeholder image */}
                            <img
                                src={`https://placehold.co/100x100/E2E8F0/4A5568?text=${encodeURIComponent(cat.substring(0, 3))}`}
                                alt={cat}
                                className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-200 dark:bg-gray-600 object-cover"
                            />
                            <p className="font-semibold text-gray-800 text-lg dark:text-gray-100">{cat}</p>
                        </Link>
                    ))}
                </div>
            )}
            {showToast && (
                <NotificationToast
                    message={toastMessage}
                    type={toastType}
                    onClose={() => setShowToast(false)}
                />
            )}
        </div>
    );
};

export default AllCategoriesPage;