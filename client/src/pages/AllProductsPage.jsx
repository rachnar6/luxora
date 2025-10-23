// src/pages/AllProductsPage.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom'; // Import useSearchParams and Link
import { getProducts } from '../services/productService';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ArrowLeft } from 'lucide-react'; // Import ArrowLeft for back button

// Optional: Import FiltersSidebar if you want to add it later
// import FiltersSidebar from '../components/products/FiltersSidebar';

const AllProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get search params from URL
    const [searchParams] = useSearchParams();
    const categoryFilter = searchParams.get('category'); // Get the 'category' value

    // TODO: Add state for other filters if using FiltersSidebar
    // const [filters, setFilters] = useState({});

    useEffect(() => {
        const fetchFilteredProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                // Create filter object, including the category from URL
                const currentFilters = {};
                if (categoryFilter) {
                    currentFilters.category = categoryFilter;
                }
                // Add other filters here if needed:
                // currentFilters.brand = filters.brand;
                // currentFilters.minPrice = filters.minPrice;
                // ...etc.

                // Pass the filters object to getProducts
                const data = await getProducts(currentFilters);
                setProducts(data);
            } catch (err) {
                console.error("Failed to fetch products:", err);
                setError('Failed to fetch products. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchFilteredProducts();
        // Add categoryFilter to dependency array
    }, [categoryFilter /* Add other filter states here if using */]); // Re-fetch when categoryFilter changes

    if (loading) return <LoadingSpinner />;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Optional: Add a back button */}
            <Link
               to="/"
               className="inline-flex items-center text-primary hover:text-primary-dark mb-6 font-medium dark:text-primary-light dark:hover:text-primary"
            >
                <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
            </Link>

            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">
                {/* Dynamically set title based on filter */}
                {categoryFilter ? `Products in ${categoryFilter}` : 'All Products'}
            </h1>

            {/* Optional Sidebar */}
            {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <aside className="md:col-span-1">
                     <FiltersSidebar onFilterChange={setFilters} />
                </aside>
                <main className="md:col-span-3"> */}

            {error ? (
                <div className="text-center text-red-500 mt-8 bg-red-100 p-4 rounded dark:bg-red-900/30">
                    {error}
                </div>
            ) : products.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                     {products.map((product) => (
                         <ProductCard key={product._id} product={product} />
                     ))}
                 </div>
            ) : (
                 <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
                     No products found{categoryFilter ? ` in ${categoryFilter}` : ''}.
                 </p>
            )}

            {/* Optional Sidebar closing div */}
            {/* </main>
             </div> */}
        </div>
    );
};

export default AllProductsPage;