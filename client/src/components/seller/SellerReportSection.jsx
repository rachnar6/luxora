// src/components/seller/SellerReportSection.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import {
    TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package,
    Plus, Calendar, Save, XCircle, Printer, RefreshCw // Added RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext'; // To get token if needed by API instance
import API from '../../services/api'; // Use your configured API instance
import LoadingSpinner from '../common/LoadingSpinner';
// Basic CSS - consider using Tailwind for consistency if preferred
import './SellerReportSection.css'; // Make sure this CSS file exists and is styled

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Helper to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(amount || 0);
};

// Helper to format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
};


const SellerReportSection = () => {
    const { token } = useAuth(); // Needed if your API instance doesn't automatically handle auth

    // --- State ---
    const [reportData, setReportData] = useState(null);
    const [loadingReport, setLoadingReport] = useState(true); // Manages initial load and refresh loading
    const [reportError, setReportError] = useState(null);

    const [expensesList, setExpensesList] = useState([]);
    const [loadingExpenses, setLoadingExpenses] = useState(false);
    const [expenseListError, setExpenseListError] = useState(null);

    const [selectedPeriod, setSelectedPeriod] = useState('monthly'); // 'monthly' or 'weekly'
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [showExpenseList, setShowExpenseList] = useState(false);
    const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);

    const [expenseForm, setExpenseForm] = useState({
        title: '',
        description: '',
        amount: '',
        category: 'materials',
        type: 'variable',
        date: new Date().toISOString().split('T')[0]
    });

    // --- Data Fetching ---
    const fetchSellerReport = useCallback(async () => {
        setLoadingReport(true); // Show loading spinner during fetch/refresh
        setReportError(null);
        try {
            // NOTE: Replace '/seller/reports' with your actual backend endpoint
            const { data } = await API.get('/seller/reports'); // Assumes API handles token
             if (data) {
                 setReportData(data);
             } else {
                 throw new Error("No report data received from server");
             }
        } catch (err) {
            console.error("Error fetching seller report:", err);
            setReportError(err.response?.data?.message || err.message || 'Failed to fetch report data.');
            setReportData(null); // Clear data on error
        } finally {
            setLoadingReport(false);
        }
    }, []); // Removed token dependency assuming API instance handles it

    const fetchSellerExpenses = useCallback(async (period = 'all') => {
        setLoadingExpenses(true);
        setExpenseListError(null);
        setShowExpenseList(true);
        try {
            // NOTE: Replace '/seller/expenses' endpoint paths as needed
            let url = '/seller/expenses'; // Default: fetch all
            if (period === 'monthly') {
                 const now = new Date();
                 url = `/seller/expenses/period?type=month&year=${now.getFullYear()}&month=${now.getMonth() + 1}`;
            } else if (period === 'weekly') {
                 const now = new Date();
                 const startOfYear = new Date(now.getFullYear(), 0, 1);
                 const weekNum = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
                 url = `/seller/expenses/period?type=week&year=${now.getFullYear()}&week=${weekNum}`;
            }

            const { data } = await API.get(url); // Assumes API handles token
            setExpensesList(data || []);
        } catch (err) {
            console.error(`Error fetching ${period} expenses:`, err);
            setExpenseListError(err.response?.data?.message || err.message || `Failed to fetch ${period} expenses.`);
            setExpensesList([]);
        } finally {
            setLoadingExpenses(false);
        }
    }, []); // Removed token dependency

    useEffect(() => {
        fetchSellerReport(); // Fetch report on component mount
    }, [fetchSellerReport]);

    // --- Handlers ---
    const handleExpenseInputChange = (e) => {
        const { name, value } = e.target;
        setExpenseForm(prev => ({ ...prev, [name]: value }));
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingExpense(true);
        try {
            // NOTE: Replace '/seller/expenses' with your POST endpoint
            await API.post('/seller/expenses', expenseForm); // Assumes API handles token
            setShowExpenseForm(false);
            setExpenseForm({ // Reset form
                title: '', description: '', amount: '',
                category: 'materials', type: 'variable',
                date: new Date().toISOString().split('T')[0]
            });
            fetchSellerReport(); // Refresh report data after adding expense
            alert('Expense added successfully!');
        } catch (err) {
            console.error("Error adding expense:", err);
            alert(`Error adding expense: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsSubmittingExpense(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // --- Data Formatting for Charts ---
    const formatSalesTrendData = (salesTrend = []) => {
        return salesTrend.map(item => ({
            month: `${item._id.month}/${String(item._id.year).slice(-2)}`,
            sales: item.sales || 0,
            orders: item.orders || 0
        })).sort((a, b) => {
             const [aMonth, aYear] = a.month.split('/');
             const [bMonth, bYear] = b.month.split('/');
             if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
             return parseInt(aMonth) - parseInt(bMonth);
        });
    };

    const formatExpenseData = (expensesByCategory = []) => {
        return expensesByCategory.map(item => ({
            name: item._id || 'Uncategorized',
            value: item.total || 0,
        }));
    };

    // --- Default values for rendering before data loads or if data is missing ---
    const overview = reportData?.overview || { totalSales: 0, totalOrders: 0 };
    const currentPeriod = reportData?.currentPeriod || {
        weekly: { sales: 0, orders: 0, expenses: 0, profit: 0 },
        monthly: { sales: 0, orders: 0, expenses: 0, profit: 0 },
    };
    const recentOrders = reportData?.recentOrders || [];
    const salesTrend = reportData?.salesTrend || [];
    const expensesByCategory = reportData?.expensesByCategory || [];
    const periodData = currentPeriod[selectedPeriod] || { sales: 0, orders: 0, expenses: 0, profit: 0 };

    return (
        <div className="seller-report-section">
            <div className="reports-header">
                <h2>📊 My Performance Report</h2>
                <div className="reports-actions">
                    {/* Refresh Button */}
                    <button
                        onClick={fetchSellerReport}
                        disabled={loadingReport}
                        className="refresh-btn" // Add specific styles if needed
                        title="Refresh Report Data"
                    >
                        <RefreshCw size={16} className={loadingReport ? 'animate-spin' : ''} /> Refresh
                    </button>
                    {/* Period Selector */}
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="period-selector"
                        aria-label="Select report period"
                        disabled={loadingReport} // Disable while loading
                    >
                        <option value="weekly">Weekly View</option>
                        <option value="monthly">Monthly View</option>
                    </select>
                    {/* Print Button */}
                    <button onClick={handlePrint} className="print-btn" title="Print Report" disabled={loadingReport}>
                        <Printer size={16} /> Print
                    </button>
                    {/* Add Expense Button */}
                    <button onClick={() => setShowExpenseForm(true)} className="add-expense-btn" title="Add New Expense" disabled={loadingReport}>
                        <Plus size={16} /> Add Expense
                    </button>
                </div>
            </div>

            {/* Loading Overlay or Error Message */}
            {loadingReport && (
                 <div className="loading-overlay" style={{ textAlign: 'center', padding: '2rem' }}> {/* Basic overlay style */}
                    <LoadingSpinner /> Loading Report...
                 </div>
            )}
            {reportError && !loadingReport && (
                <div className="error-message">
                    {reportError} <button onClick={fetchSellerReport}>Retry</button>
                </div>
            )}

            {/* Render Cards and Charts ONLY if data exists and no error */}
            {!loadingReport && !reportError && reportData && (
                <>
                    {/* Summary Cards */}
                    <div className="summary-cards-grid">
                        {/* Total Revenue */}
                        <div className="summary-card revenue">
                            <DollarSign size={24} />
                            <div>
                                <h3>Total Revenue</h3>
                                <p>{formatCurrency(overview.totalSales)}</p>
                                <span>{overview.totalOrders} orders</span>
                            </div>
                        </div>
                        {/* Profit (Weekly/Monthly) */}
                        <div className="summary-card profit">
                            {periodData.profit >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                            <div>
                                <h3>{selectedPeriod === 'monthly' ? 'This Month' : 'This Week'} Profit</h3>
                                <p className={periodData.profit >= 0 ? 'positive' : 'negative'}>
                                    {formatCurrency(periodData.profit)}
                                </p>
                                <span className={periodData.profit >= 0 ? 'positive' : 'negative'}>
                                   ({formatCurrency(periodData.sales)} Sales - {formatCurrency(periodData.expenses)} Expenses)
                                </span>
                            </div>
                        </div>
                        {/* Sales (Weekly/Monthly) */}
                         <div className="summary-card sales">
                             <ShoppingCart size={24} />
                             <div>
                                 <h3>{selectedPeriod === 'monthly' ? 'This Month' : 'This Week'} Sales</h3>
                                 <p>{formatCurrency(periodData.sales)}</p>
                                 <span>{periodData.orders} orders</span>
                             </div>
                         </div>
                         {/* Expenses (Weekly/Monthly) */}
                        <div className="summary-card expenses clickable" onClick={() => !loadingExpenses && fetchSellerExpenses(selectedPeriod)}>
                            <Package size={24} />
                            <div>
                                <h3>{selectedPeriod === 'monthly' ? 'This Month' : 'This Week'} Expenses</h3>
                                <p>{formatCurrency(periodData.expenses)}</p>
                                <span>{loadingExpenses ? 'Loading...' : 'Click to view details'}</span>
                            </div>
                        </div>
                    </div>

                     {/* Charts Grid */}
                     <div className="charts-grid">
                         {/* Sales Trend Chart */}
                         <div className="chart-container large">
                             <h3>Sales Trend (Last 12 Months)</h3>
                             {salesTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={formatSalesTrendData(salesTrend)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                        <XAxis dataKey="month" fontSize={12} />
                                        <YAxis fontSize={12} tickFormatter={formatCurrency} width={80} /> {/* Added width */}
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                        <Area type="monotone" dataKey="sales" stroke="#8884d8" fillOpacity={1} fill="url(#colorSales)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                             ) : (<p className="no-chart-data">Not enough data for sales trend chart.</p>)}
                         </div>

                         {/* Expense Breakdown Pie Chart */}
                         <div className="chart-container">
                             <h3>Expense Breakdown (All Time)</h3>
                             {expensesByCategory.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={formatExpenseData(expensesByCategory)}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            fontSize={12}
                                        >
                                            {formatExpenseData(expensesByCategory).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (<p className="no-chart-data">No expense data available for breakdown.</p>)}
                        </div>
                    </div>

                    {/* Recent Orders Table */}
                    <div className="recent-orders-section">
                        <h2>📦 Recent Orders</h2>
                        <div className="orders-table-container">
                            <table className="orders-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.length > 0 ? (
                                        recentOrders.map(order => (
                                            <tr key={order._id}>
                                                <td>#{order.orderNumber || order._id.slice(-6)}</td>
                                                <td>{order.user?.name || order.shippingAddress?.name || 'N/A'}</td>
                                            <td>{formatDate(order.createdAt)}</td>
                                            <td><span className={`status-badge status-${order.orderStatus?.toLowerCase() || 'unknown'}`}>{order.orderStatus || 'N/A'}</span></td>
                                            <td className="amount">{formatCurrency(order.totalPrice || order.totalAmount)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="no-data">No recent orders found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* --- Modals --- */}
            {/* Expense Form Modal */}
            {showExpenseForm && (
                <div className="modal-overlay" onClick={() => !isSubmittingExpense && setShowExpenseForm(false)}> {/* Prevent closing while submitting */}
                    <div className="expense-form-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Expense</h3>
                            <button onClick={() => setShowExpenseForm(false)} className="close-btn" title="Close" disabled={isSubmittingExpense}><XCircle size={20} /></button>
                        </div>
                        <form onSubmit={handleExpenseSubmit} className="expense-form">
                            {/* Title */}
                            <div className="form-group">
                                <label htmlFor="title">Title *</label>
                                <input id="title" name="title" type="text" value={expenseForm.title} onChange={handleExpenseInputChange} required placeholder="e.g., Fabric Purchase"/>
                            </div>
                             {/* Amount */}
                            <div className="form-group">
                                 <label htmlFor="amount">Amount (INR) *</label>
                                 <input id="amount" name="amount" type="number" min="0.01" step="0.01" value={expenseForm.amount} onChange={handleExpenseInputChange} required placeholder="0.00"/>
                            </div>
                            {/* Date */}
                             <div className="form-group">
                                 <label htmlFor="date">Date *</label>
                                 <input id="date" name="date" type="date" value={expenseForm.date} onChange={handleExpenseInputChange} required max={new Date().toISOString().split('T')[0]} />
                            </div>
                             {/* Category */}
                             <div className="form-group">
                                 <label htmlFor="category">Category *</label>
                                 <select id="category" name="category" value={expenseForm.category} onChange={handleExpenseInputChange} required>
                                     <option value="materials">Materials</option>
                                     <option value="tools">Tools</option>
                                     <option value="packaging">Packaging</option>
                                     <option value="shipping">Shipping</option>
                                     <option value="marketing">Marketing</option>
                                     <option value="utilities">Utilities</option>
                                     <option value="rent">Rent / Space</option>
                                     <option value="labor">Labor / Fees</option>
                                     <option value="maintenance">Maintenance</option>
                                     <option value="fees">Fees</option> {/* Added Fees */}
                                     <option value="miscellaneous">Miscellaneous</option>
                                 </select>
                            </div>
                            {/* Type */}
                            <div className="form-group">
                                 <label htmlFor="type">Type</label>
                                 <select id="type" name="type" value={expenseForm.type} onChange={handleExpenseInputChange}>
                                     <option value="variable">Variable</option>
                                     <option value="fixed">Fixed</option>
                                 </select>
                            </div>
                            {/* Description */}
                            <div className="form-group description">
                                <label htmlFor="description">Description</label>
                                <textarea id="description" name="description" value={expenseForm.description} onChange={handleExpenseInputChange} placeholder="Optional details..." rows="3"/>
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={() => setShowExpenseForm(false)} className="cancel-btn" disabled={isSubmittingExpense}>Cancel</button>
                                <button type="submit" className="submit-btn" disabled={isSubmittingExpense}>
                                    {isSubmittingExpense ? <LoadingSpinner size="xs" /> : <><Save size={16}/> Add Expense</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

             {/* Expense List Modal */}
             {showExpenseList && (
                 <div className="modal-overlay" onClick={() => !loadingExpenses && setShowExpenseList(false)}> {/* Prevent closing while loading */}
                     <div className="expense-list-modal" onClick={(e) => e.stopPropagation()}>
                         <div className="modal-header">
                             <h3>{selectedPeriod === 'monthly' ? 'This Month\'s' : 'This Week\'s'} Expenses ({expensesList.length})</h3>
                             <button onClick={() => setShowExpenseList(false)} className="close-btn" title="Close" disabled={loadingExpenses}><XCircle size={20} /></button>
                         </div>
                         <div className="expense-list-content">
                             {loadingExpenses ? (
                                 <LoadingSpinner />
                             ) : expenseListError ? (
                                 <div className="error-message">{expenseListError}</div>
                             ) : expensesList.length === 0 ? (
                                 <p className="no-data">No expenses recorded for this period.</p>
                             ) : (
                                <div className="expenses-table-container">
                                    <table className="expenses-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Title</th>
                                                <th>Category</th>
                                                <th>Type</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expensesList.map((expense) => (
                                                <tr key={expense._id}>
                                                    <td>{formatDate(expense.date)}</td>
                                                    <td title={expense.description || expense.title}>{expense.title}</td>
                                                    <td><span className="badge">{expense.category}</span></td>
                                                    <td><span className={`type-badge type-${expense.type}`}>{expense.type}</span></td>
                                                    <td className="amount">{formatCurrency(expense.amount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                         <tfoot>
                                             <tr>
                                                 <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                                                 <td className="amount total">
                                                     {formatCurrency(expensesList.reduce((sum, exp) => sum + exp.amount, 0))}
                                                 </td>
                                             </tr>
                                         </tfoot>
                                    </table>
                                </div>
                             )}
                         </div>
                     </div>
                 </div>
             )}
        </div>
    );
};

export default SellerReportSection;