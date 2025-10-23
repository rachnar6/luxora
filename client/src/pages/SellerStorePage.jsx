// src/pages/SellerStorePage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductsBySeller } from '../services/productService';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import API from '../services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DollarSign, ShoppingCart, BarChart3 } from 'lucide-react';

// --- Helper Functions ---
const formatCurrency = (amount) => {
    const numericValue = Number(amount);
     if (isNaN(numericValue)) return '₹0.00';
     return new Intl.NumberFormat('en-IN', {
         style: 'currency',
         currency: 'INR',
         minimumFractionDigits: 2,
         maximumFractionDigits: 2,
     }).format(numericValue);
};

const formatSalesTrendData = (salesTrend = []) => {
    return salesTrend.map(item => ({
        month: `${String(item._id.month).padStart(2, '0')}/${String(item._id.year).slice(-2)}`,
        sales: item.sales || 0,
    })).sort((a, b) => {
         const [aMonth, aYear] = a.month.split('/');
         const [bMonth, bYear] = b.month.split('/');
         if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
         return parseInt(aMonth) - parseInt(bMonth);
    });
};
// --- End Helper Functions ---


const SellerStorePage = () => {
    const { id: sellerId } = useParams();
    const [sellerInfo, setSellerInfo] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [loadingReport, setLoadingReport] = useState(true);
    const [reportError, setReportError] = useState(null);

    useEffect(() => {
        const fetchSellerData = async () => {
            setLoading(true); setLoadingReport(true); setError(null); setReportError(null);
            try {
                const [sellerPageDataPromise, publicReportDataPromise] = [
                    getProductsBySeller(sellerId),
                    API.get(`/seller/${sellerId}/report`)
                ];
                const sellerPageData = await sellerPageDataPromise;
                const publicReportData = await publicReportDataPromise;

                if (sellerPageData?.seller) {
                    setSellerInfo(sellerPageData.seller);
                    setProducts(sellerPageData.products || []);
                } else {
                    throw new Error('Seller information not found.');
                }
                if (publicReportData?.data) {
                     setReportData(publicReportData.data);
                } else {
                     console.warn("No public report data found for seller:", sellerId);
                     setReportData(null);
                }
            } catch (err) {
                console.error("Error fetching seller store page data:", err);
                const message = err.response?.data?.message || err.message || 'Failed to load seller page';
                setError(message);
                if (!reportData) { setReportError("Could not load seller analytics."); }
            } finally {
                setLoading(false); setLoadingReport(false);
            }
        };
        if (sellerId) { fetchSellerData(); }
        else { setError("Seller ID not provided."); setLoading(false); setLoadingReport(false); }
    }, [sellerId]);

    const overview = reportData?.overview || { totalSales: 0, totalOrders: 0 };
    const salesTrend = reportData?.salesTrend || [];
    const formattedSalesTrend = formatSalesTrendData(salesTrend);

    if (loading && !error) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-500 mt-8 p-4">{error}</div>;
    if (!sellerInfo) return <div className="text-center text-gray-500 mt-8">Seller not found.</div>;

    return (
        <div className="container mx-auto px-4 py-8 dark:text-gray-200">
            {/* Seller Header */}
            <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold dark:text-gray-100">{sellerInfo.brandName || sellerInfo.name}</h1>
                    {sellerInfo.bio && <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">{sellerInfo.bio}</p>}
                </div>
            </div>

            {/* Public Analytics Section */}
            <section className="mb-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-6 dark:text-gray-100 flex items-center gap-2 border-b pb-3 dark:border-gray-700">
                    <BarChart3 size={24}/> Seller Analytics
                </h2>
                {loadingReport ? ( <LoadingSpinner /> )
                 : reportError ? ( <p className="text-center text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 p-3 rounded">{reportError}</p> )
                 : reportData ? (
                    <div className="space-y-6"> {/* Use space-y instead of grid for flexibility */}
                        {/* Summary Cards */}
                        {/* 👇👇👇 Changed md:grid-cols-3 to md:grid-cols-2 👇👇👇 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="summary-card bg-gray-50 dark:bg-gray-700/50 p-4 rounded shadow border-l-4 border-blue-500 flex items-center gap-3">
                                 <DollarSign size={24} className="text-blue-500 flex-shrink-0"/>
                                 <div>
                                     <h3 className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Total Revenue</h3>
                                     <p className="text-xl font-bold dark:text-gray-100">{formatCurrency(overview.totalSales)}</p>
                                 </div>
                             </div>
                             <div className="summary-card bg-gray-50 dark:bg-gray-700/50 p-4 rounded shadow border-l-4 border-amber-500 flex items-center gap-3">
                                 <ShoppingCart size={24} className="text-amber-500 flex-shrink-0"/>
                                 <div>
                                     <h3 className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Total Orders</h3>
                                     <p className="text-xl font-bold dark:text-gray-100">{overview.totalOrders}</p>
                                 </div>
                             </div>
                             {/* 👇👇👇 Removed the empty placeholder div 👇👇👇 */}
                        </div>

                         {/* Sales Trend Chart */}
                         <div className="chart-container bg-gray-50 dark:bg-gray-700/50 p-4 rounded shadow">
                            <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Sales Trend (Last 12 Months)</h3>
                            {formattedSalesTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={formattedSalesTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                         <defs>
                                             <linearGradient id="publicSalesGradient" x1="0" y1="0" x2="0" y2="1">
                                                 <stop offset="5%" stopColor="#8884d8" stopOpacity={0.7}/>
                                                 <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                                             </linearGradient>
                                         </defs>
                                         <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                         <XAxis dataKey="month" fontSize={10} stroke="#6b7280" />
                                         <YAxis fontSize={10} tickFormatter={(val) => formatCurrency(val)} stroke="#6b7280" width={70}/>
                                         <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', dark: { backgroundColor: 'rgba(55, 65, 81, 0.8)' } }} itemStyle={{ color: '#374151', dark: { color: '#e5e7eb' } }} formatter={(value) => formatCurrency(value)} />
                                         <Area type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} fillOpacity={1} fill="url(#publicSalesGradient)" />
                                     </AreaChart>
                                 </ResponsiveContainer>
                            ) : (<p className="no-chart-data dark:text-gray-400 text-center py-10 italic">Not enough data for sales trend chart.</p>)}
                         </div>
                    </div>
                 ) : (
                     <p className="text-center text-gray-500 dark:text-gray-400 italic py-6">Analytics data not available for this seller.</p>
                 )}
            </section>

            {/* Seller Products Section */}
            <section className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-6 dark:text-gray-100 border-b pb-3 dark:border-gray-700">Products from this Seller ({products.length})</h2>
                {loading ? ( <LoadingSpinner /> )
                 : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-6 italic">This seller has not added any products yet.</p>
                )}
            </section>
        </div>
    );
};

export default SellerStorePage;