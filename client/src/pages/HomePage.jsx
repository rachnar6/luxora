import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import { useProducts } from '../contexts/ProductContext';
import { getProducts, getUniqueCategories, getDeals, getTopSellingProducts, getLatestProducts, getBrands } from '../services/productService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Filter, Search, Tag, Star, XCircle } from 'lucide-react';

const HomePage = () => {
    const navigate = useNavigate();
    
    // Get all filter state and setters from the shared context
    const { 
        category, setCategory, 
        brand, setBrand, 
        minPrice, setMinPrice, 
        maxPrice, setMaxPrice,
        rating, setRating // Get rating state
    } = useProducts();
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [uniqueCategories, setUniqueCategories] = useState([]);
    const [availableBrands, setAvailableBrands] = useState([]);
    const [deals, setDeals] = useState([]);
    const [topSelling, setTopSelling] = useState([]);
    const [latestProducts, setLatestProducts] = useState([]);

    const [searchInput, setSearchInput] = useState('');
    const [heroIndex, setHeroIndex] = useState(0);
    const productsRef = useRef(null);
    
    const heroContent = [
        { title: "Discover Your Style", subtitle: "Explore our curated collection of the finest products." },
        { title: "New Arrivals Daily", subtitle: "Fresh looks and the latest trends are waiting for you." },
        { title: "Unbeatable Quality", subtitle: "We provide only the best, because you deserve nothing less." }
    ];

    useEffect(() => {
        const cycleInterval = setInterval(() => {
            setHeroIndex(prevIndex => (prevIndex + 1) % heroContent.length);
        }, 4000);
        return () => clearInterval(cycleInterval);
    }, [heroContent.length]);

    // This is the main data fetching effect that now watches for all filter changes
    useEffect(() => {
        const fetchPageData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Always fetch filter options
                if (uniqueCategories.length === 0) {
                    const categoriesData = await getUniqueCategories();
                    setUniqueCategories(categoriesData);
                }
                
                // Construct filters object from state
                const filters = { category, brand, minPrice, maxPrice, rating };
                const data = await getProducts(filters);
                setProducts(data);

                // Fetch other sections only if no filters are active
                const anyFilterActive = category || brand || minPrice || maxPrice || rating > 0;
                if (!anyFilterActive) {
                    const [dealsData, topSellingData, latestData] = await Promise.all([
                        getDeals(), getTopSellingProducts(), getLatestProducts()
                    ]);
                    setDeals(dealsData);
                    setTopSelling(topSellingData);
                    setLatestProducts(latestData);
                }

            } catch (err) {
                setError('Failed to load products. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        
        // Use a timeout to "debounce" the fetch, preventing API calls on every keystroke
        const handler = setTimeout(() => {
            fetchPageData();
        }, 300);

        return () => clearTimeout(handler);

    }, [category, brand, minPrice, maxPrice, rating]);
    
    useEffect(() => {
        const fetchBrands = async () => {
            if (category) {
                try {
                    const brandsData = await getBrands(category);
                    setAvailableBrands(brandsData);
                } catch (error) {
                    console.error("Failed to fetch brands:", error);
                    setAvailableBrands([]);
                }
            } else {
                setAvailableBrands([]);
            }
        };
        fetchBrands();
    }, [category]);

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
        setBrand(''); // Reset brand when category changes
    };

    const handleClearFilters = () => {
        setCategory(''); 
        setBrand(''); 
        setMinPrice(''); 
        setMaxPrice(''); 
        setRating(0); // Reset rating filter
    };

    const handleShopNowClick = () => {
        productsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/search?keyword=${searchInput.trim()}`);
        }
    };

    const anyFilterActive = category || brand || minPrice || maxPrice || rating > 0;

    if (loading && products.length === 0 && deals.length === 0) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-500 mt-8">{error}</div>;

    return (
        <div className="space-y-12">
            <section className="text-center bg-white py-16 px-4 rounded-lg shadow-md dark:bg-gray-800">
                <div key={heroIndex} className="min-h-[160px] animate-fade-in-down">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-gray-800 dark:text-gray-100">
                        {heroContent[heroIndex].title}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                        {heroContent[heroIndex].subtitle}
                    </p>
                </div>
                <form onSubmit={handleSearchSubmit} className="mt-8 mb-6 flex justify-center">
                    <div className="relative w-full max-w-xl flex">
                        <input type="text" placeholder="Search for products..." className="flex-grow p-4 pl-12 pr-4 rounded-l-full text-gray-800 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                        <button type="submit" className="px-8 py-3 bg-primary text-white font-bold rounded-r-full shadow-lg hover:bg-primary-dark transition-colors">Search</button>
                    </div>
                </form>
                <button onClick={handleShopNowClick} className="px-10 py-4 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary-dark transform hover:scale-105 transition-all duration-300">Shop Now</button>
            </section>

            <aside className="bg-white rounded-lg shadow-md p-8 dark:bg-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3"><Filter className="w-8 h-8 text-primary" /> Filters</h2>
                    <button onClick={handleClearFilters} className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                        <XCircle size={16} /> Clear All
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div>
                        <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Category</label>
                        <select id="category-select" className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" value={category} onChange={handleCategoryChange}>
                            <option value="">All Categories</option>
                            {uniqueCategories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="brand-select" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Brand</label>
                        <select id="brand-select" className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700/50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" value={brand} onChange={(e) => setBrand(e.target.value)} disabled={!category}>
                            <option value="">All Brands</option>
                            {availableBrands.map((b) => (<option key={b} value={b}>{b}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Price Range</label>
                        <div className="flex items-center gap-2">
                            <input type="number" placeholder="Min" className="w-1/2 p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} min="0" />
                            <input type="number" placeholder="Max" className="w-1/2 p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} min="0" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Rating</label>
                        <div className="flex items-center justify-around bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            {[4, 3, 2, 1].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setRating(rating === star ? 0 : star)}
                                    className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm font-semibold transition-colors ${rating === star ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                >
                                    {star}<Star size={14} className="text-yellow-400" fill="currentColor"/>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            <main id="products" ref={productsRef} className="container mx-auto">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">
                    {anyFilterActive ? 'Filtered Results' : 'Latest Products'}
                </h2>
                {loading ? <LoadingSpinner /> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.length > 0 ? (
                            products.map((product) => (<ProductCard key={product._id} product={product} />))
                        ) : (
                            <p className="col-span-full text-center text-gray-500 dark:text-gray-400">No products match your current filters.</p>
                        )}
                    </div>
                )}

                {!anyFilterActive && (
                    <div className="space-y-12 mt-12">
                        <section>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 text-center mb-8">Deals of the Day</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {deals.map(p => p && <ProductCard key={p._id} product={p} />)}
                            </div>
                        </section>
                        <section>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 text-center mb-8">Top Selling Products</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {topSelling.map(p => p && <ProductCard key={p._id} product={p} />)}
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
};

export default HomePage;

