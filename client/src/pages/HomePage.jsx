// src/pages/HomePage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import ProductCard from '../components/products/ProductCard'; // Used within category tabs section
import { useProducts } from '../contexts/ProductContext';
import { getProducts, getUniqueCategories, getDeals, getTopSellingProducts, getBrands } from '../services/productService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Filter, Search, Star, XCircle, ChevronRight } from 'lucide-react'; // Added ChevronRight
import HeroCarousel from '../components/common/HeroCarousel';
import ProductGrid from '../components/products/ProductGrid'; // Used for Deals, Top Selling, All Products

const HomePage = () => {
    const navigate = useNavigate();
    const productsRef = useRef(null);

    // --- Filter Context State ---
    const {
        category: filterCategory, setCategory: setFilterCategory,
        brand, setBrand,
        minPrice, setMinPrice,
        maxPrice, setMaxPrice,
        rating, setRating
    } = useProducts();

    // --- Page State ---
    const [products, setProducts] = useState([]); // Holds filtered or ALL products (for the last section)
    const [loading, setLoading] = useState(true); // Overall page loading
    const [error, setError] = useState(null); // Overall page error
    const [uniqueCategories, setUniqueCategories] = useState([]);
    const [availableBrands, setAvailableBrands] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [heroIndex, setHeroIndex] = useState(0); // For text animation

    // --- Section State ---
    const [deals, setDeals] = useState([]);
    const [topSelling, setTopSelling] = useState([]);

    // --- Category Tab State ---
    const [categoriesForTabs, setCategoriesForTabs] = useState([]);
    const [activeCategoryTab, setActiveCategoryTab] = useState('');
    const [categoryTabProducts, setCategoryTabProducts] = useState([]);
    const [categoryTabLoading, setCategoryTabLoading] = useState(false);
    const [categoryTabError, setCategoryTabError] = useState(null);

    // --- Hero Content ---
    const heroContent = [
        { title: "Discover Your Style", subtitle: "Explore our curated collection of the finest products." },
        { title: "New Arrivals Daily", subtitle: "Fresh looks and the latest trends are waiting for you." },
        { title: "Unbeatable Quality", subtitle: "We provide only the best, because you deserve nothing less." }
    ];

    // --- Hero Text Animation useEffect ---
    useEffect(() => {
        const cycleInterval = setInterval(() => {
            setHeroIndex(prevIndex => (prevIndex + 1) % heroContent.length);
        }, 4000);
        return () => clearInterval(cycleInterval);
    }, [heroContent.length]); // Dependency added

    // --- Main Data Fetching useEffect (Handles Sections & Initial Tab Setup) ---
    useEffect(() => {
        const fetchPageData = async () => {
            setLoading(true);
            setError(null);
            setCategoryTabLoading(true); // Also set tab loading initially
            setCategoryTabError(null);

            try {
                const currentFilters = { category: filterCategory, brand, minPrice, maxPrice, rating };
                const anyFilterActive = filterCategory || brand || minPrice || maxPrice || rating > 0;

                // --- Fetch Categories ---
                let fetchedCategories = uniqueCategories;
                if (fetchedCategories.length === 0) {
                    fetchedCategories = await getUniqueCategories();
                    setUniqueCategories(fetchedCategories);
                }

                // --- Setup Tabs ---
                const tabsToShow = fetchedCategories.slice(0, 5); // Show first 5 categories as tabs
                setCategoriesForTabs(tabsToShow);
                const initialActiveTab = tabsToShow.length > 0 ? tabsToShow[0] : '';
                // Set initial active tab only once or if it becomes empty
                if (tabsToShow.length > 0 && activeCategoryTab === '') {
                    setActiveCategoryTab(initialActiveTab);
                } else if (tabsToShow.length === 0) {
                     setActiveCategoryTab(''); // Clear active tab if no categories exist
                }


                // --- Fetch Data Based on Filters ---
                if (anyFilterActive) {
                    const data = await getProducts(currentFilters);
                    setProducts(data);
                    // Clear section/tab data when filters are active
                    setDeals([]);
                    setTopSelling([]);
                    setCategoryTabProducts([]);
                    setCategoryTabLoading(false); // Stop tab loading if filtering
                } else {
                    // Fetch sections (Deals, Top Selling) and All Products concurrently
                    const [allProductsData, dealsData, topSellingData] = await Promise.all([
                        getProducts(), // Get all products for the main list at the bottom
                        getDeals(),
                        getTopSellingProducts(),
                    ]);
                    setProducts(allProductsData);
                    setDeals(dealsData);
                    setTopSelling(topSellingData);
                    // Initial tab products are fetched in the separate useEffect below
                }
            } catch (err) {
                console.error("Failed to load initial page data:", err);
                setError('Failed to load products. Please try again.');
                // Clear all data on error
                setProducts([]);
                setDeals([]);
                setTopSelling([]);
                setCategoriesForTabs([]);
                setActiveCategoryTab('');
                setCategoryTabProducts([]);
                setCategoryTabError('Failed to load category data.');
            } finally {
                setLoading(false); // Overall page loading finished
                // Tab loading finishes in its own useEffect or here if filtering
                 if (filterCategory || brand || minPrice || maxPrice || rating > 0) {
                    setCategoryTabLoading(false);
                 }
            }
        };

        // Debounce fetching slightly on filter changes
        const handler = setTimeout(fetchPageData, 300);
        return () => clearTimeout(handler);

    }, [filterCategory, brand, minPrice, maxPrice, rating, uniqueCategories.length]); // Rerun when filters change or categories are first loaded


    // --- useEffect for Fetching Products When Active Tab Changes ---
    useEffect(() => {
        const anyFilterActive = filterCategory || brand || minPrice || maxPrice || rating > 0;
        // Only fetch if filters are NOT active AND an active tab IS set
        if (anyFilterActive || !activeCategoryTab) {
            setCategoryTabProducts([]); // Clear products
            setCategoryTabLoading(false); // Ensure loading is off if no fetch happens
            return; // Exit early
        }

        const fetchCategoryProducts = async () => {
            setCategoryTabLoading(true);
            setCategoryTabError(null);
            try {
                const data = await getProducts({ category: activeCategoryTab });
                // Show only the first 4 products in the tab view
                setCategoryTabProducts(data.slice(0, 4));
            } catch (err) {
                console.error(`Failed to fetch products for category ${activeCategoryTab}:`, err);
                setCategoryTabError(`Failed to load products for ${activeCategoryTab}.`);
                setCategoryTabProducts([]);
            } finally {
                setCategoryTabLoading(false);
            }
        };

        fetchCategoryProducts();
        // This effect depends ONLY on the active tab changing (when filters are inactive)
    }, [activeCategoryTab, filterCategory, brand, minPrice, maxPrice, rating]);


    // --- Brand Fetching useEffect ---
    useEffect(() => {
        const fetchBrands = async () => {
            if (filterCategory) { // Use filterCategory from context
                try {
                    const brandsData = await getBrands(filterCategory);
                    setAvailableBrands(brandsData);
                } catch (error) {
                    console.error("Failed to fetch brands:", error);
                    setAvailableBrands([]);
                }
            } else {
                setAvailableBrands([]); // Clear brands if no category selected in filter
            }
        };
        fetchBrands();
    }, [filterCategory]); // Run only when the filter category changes


    // --- Event Handlers ---
    const handleCategoryChange = (e) => {
        setFilterCategory(e.target.value); // Use filter context setter
        setBrand(''); // Reset brand filter when category filter changes
    };

    const handleClearFilters = () => {
        setFilterCategory('');
        setBrand('');
        setMinPrice('');
        setMaxPrice('');
        setRating(0);
    };

    const handleShopNowClick = () => {
        productsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/search?keyword=${encodeURIComponent(searchInput.trim())}`);
        }
    };

    // --- Render Logic ---
    const anyFilterActive = filterCategory || brand || minPrice || maxPrice || rating > 0;

    // Show main loading spinner only on initial full page load
    if (loading && products.length === 0 && deals.length === 0 && topSelling.length === 0 && uniqueCategories.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-12">

            <HeroCarousel />

            <section className="text-center bg-white py-16 px-4 rounded-lg shadow-md dark:bg-gray-800 -mt-10 relative z-10">
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
                        <input
                            type="text"
                            placeholder="Search for products..."
                            className="flex-grow p-4 pl-12 pr-4 rounded-l-full text-gray-800 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                         />
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
                    {/* Category Dropdown */}
                    <div>
                        <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Category</label>
                        <select id="category-select" className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" value={filterCategory} onChange={handleCategoryChange}>
                            <option value="">All Categories</option>
                            {uniqueCategories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                        </select>
                    </div>
                    {/* Brand Dropdown */}
                    <div>
                        <label htmlFor="brand-select" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Brand</label>
                        <select id="brand-select" className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700/50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" value={brand} onChange={(e) => setBrand(e.target.value)} disabled={!filterCategory || availableBrands.length === 0}>
                            <option value="">All Brands</option>
                            {availableBrands.map((b) => (<option key={b} value={b}>{b}</option>))}
                        </select>
                    </div>
                     {/* Price Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Price Range</label>
                        <div className="flex items-center gap-2">
                            <input type="number" placeholder="Min" className="w-1/2 p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} min="0" />
                            <input type="number" placeholder="Max" className="w-1/2 p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} min="0" />
                        </div>
                    </div>
                    {/* Rating */}
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

            {/* --- Main Content Area --- */}
            <main id="products" ref={productsRef} className="container mx-auto px-4"> {/* Added px-4 for padding consistency */}
                {/* Loading/Error for Filtered Results */}
                {loading && anyFilterActive && <LoadingSpinner />}
                {error && !loading && (
                   <div className="text-center text-red-500 mt-8 bg-red-100 p-4 rounded dark:bg-red-900/30">
                       {error}
                   </div>
                )}

                {!loading && !error && (
                    anyFilterActive ? (
                        // --- Filtered Results View ---
                        <section>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">Filtered Results</h2>
                            {products.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"> {/* Standardized gap */}
                                    {products.map((product) => <ProductCard key={product._id} product={product} />)}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 mt-8">No products match your current filters.</p>
                            )}
                        </section>
                    ) : (
                        // --- Default View (Sections & Tabs) ---
                        <div className="space-y-16">
                            {/* Deals Section */}
                            <ProductGrid title="Deals of the Day" products={deals} seeAllLink="/deals" />

                            {/* Top Selling Section */}
                            <ProductGrid title="Top Selling Products" products={topSelling} seeAllLink="/top-selling" />

                            {/* Category Tabs Section */}
                            {categoriesForTabs.length > 0 && (
                                <section>
                                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4 dark:border-gray-700">
                                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                                            Shop by Category
                                        </h2>
                                        <Link
                                            to="/categories"
                                            className="text-primary font-semibold hover:underline flex items-center gap-1 text-sm dark:text-primary-light dark:hover:text-primary"
                                        >
                                            See All Categories <ChevronRight size={16}/>
                                        </Link>
                                    </div>

                                    {/* Tab Buttons */}
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {categoriesForTabs.map((catName) => (
                                            <button
                                                key={catName}
                                                onClick={() => setActiveCategoryTab(catName)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                                    activeCategoryTab === catName
                                                        ? 'bg-primary text-white shadow'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                            >
                                                {catName}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Product Grid for Active Tab */}
                                    <div className="min-h-[200px]"> {/* Added min-height to prevent layout shifts */}
                                        {categoryTabLoading ? (
                                            <div className="h-60 flex justify-center items-center">
                                               <LoadingSpinner />
                                            </div>
                                        ) : categoryTabError ? (
                                            <div className="text-center text-red-500 bg-red-100 p-4 rounded dark:bg-red-900/30">
                                                {categoryTabError}
                                            </div>
                                        ) : categoryTabProducts.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                                                {categoryTabProducts.map((product) => (
                                                    <ProductCard key={product._id} product={product} />
                                                ))}
                                                <div className="col-span-full mt-4 text-center">
                                                     <Link
                                                         to={`/products?category=${encodeURIComponent(activeCategoryTab)}`}
                                                         className="text-primary font-semibold hover:underline dark:text-primary-light dark:hover:text-primary"
                                                     >
                                                         See all in {activeCategoryTab}
                                                     </Link>
                                                 </div>
                                            </div>
                                        ) : (
                                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                                No products found in {activeCategoryTab}.
                                            </p>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* All Products Section */}
                            <ProductGrid title="All Products" products={products} seeAllLink="/products" />
                        </div>
                    )
                )}
            </main>
        </div>
    );
};

export default HomePage;