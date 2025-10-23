import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderDetails, requestReturn } from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TrackingTimeline from '../components/common/TrackingTimeline';
import { Printer, RotateCcw } from 'lucide-react';
import ConfirmationModal from '../components/common/ConfirmationModal';
import NotificationToast from '../components/common/NotificationToast';
// For printing
import { ReactToPrint } from 'react-to-print';

const formatCurrency = (value) => {
    if (typeof value !== 'number') {
        return '₹0.00';
    }
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(value);
};

const OrderDetailsPage = () => {
    const { id: orderId } = useParams();
    const { user, token } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Print Ref ---
    const componentToPrintRef = useRef(null);

    // --- State for Return ---
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [itemToReturn, setItemToReturn] = useState(null);
    const [returnReason, setReturnReason] = useState('');
    const [returnLoading, setReturnLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    // --- Fetch Order ---
    const fetchOrder = useCallback(async () => {
        if (!token) { setError("Please log in to view this order."); setLoading(false); return; }
        try {
            setLoading(true); setError(null);
            const data = await getOrderDetails(orderId, token);
            setOrder(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch order');
        } finally {
            setLoading(false);
        }
    }, [orderId, token]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    // --- Handlers ---
    const handleOpenReturnModal = (item) => {
        if (item.returnStatus !== 'None') {
            setToast({ show: true, message: `Return already ${item.returnStatus.toLowerCase()}.`, type: 'info' });
            return;
        }
        setItemToReturn(item);
        setReturnReason('');
        setShowReturnModal(true);
    };

    const handleReturnSubmit = async () => {
        if (!itemToReturn || !returnReason.trim()) {
            setToast({ show: true, message: 'Please provide a reason for the return.', type: 'error' });
            return;
        }
        setReturnLoading(true);
        try {
            const updatedOrder = await requestReturn(orderId, itemToReturn._id, returnReason);
            setOrder(updatedOrder);
            setShowReturnModal(false);
            setItemToReturn(null);
            setToast({ show: true, message: 'Return requested successfully!', type: 'success' });
        } catch (err) {
            setToast({ show: true, message: err.response?.data?.message || 'Failed to request return.', type: 'error' });
        } finally {
            setReturnLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-500 mt-8">{error}</div>;
    if (!order) return <div className="text-center text-gray-500 mt-8">Order not found.</div>;

    const isBuyer = user?._id === order.user?._id;

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto my-8 dark:bg-gray-800" ref={componentToPrintRef}>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                        Order #{order.orderNumber || order._id.substring(18)}
                    </h1>
                    {/* Print Button (uncomment once ReactToPrint is set up) */}
                    {/* 
                    <ReactToPrint
                        trigger={() => (
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300">
                                <Printer size={18} /> Print
                            </button>
                        )}
                        content={() => componentToPrintRef.current}
                    />
                    */}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        {/* Tracking */}
                        <TrackingTimeline history={order.trackingHistory} />
                        {/* Shipping */}
                        <div className="border-b pb-4 dark:border-gray-700">
                            <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">Shipping</h2>
                            <p><strong>Name: </strong>{order.shippingAddress.name || order.user.name}</p>
                            <p><strong>Email: </strong>
                                <a href={`mailto:${order.user.email}`} className="text-primary hover:underline">{order.user.email}</a>
                            </p>
                            <p><strong>Address: </strong>
                                {`${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`}
                            </p>
                            {order.isDelivered
                                ? <div className="mt-2 p-2 bg-green-100 text-green-700 rounded-md text-sm">Delivered on {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : ''}</div>
                                : <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-md text-sm">Not Delivered</div>
                            }
                        </div>
                        {/* Payment */}
                        <div className="border-b pb-4 dark:border-gray-700">
                            <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">Payment</h2>
                            <p><strong>Method: </strong>{order.paymentMethod}</p>
                            {order.isPaid
                                ? <div className="mt-2 p-2 bg-green-100 text-green-700 rounded-md text-sm">Paid on {order.paidAt ? new Date(order.paidAt).toLocaleDateString() : ''}</div>
                                : <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-md text-sm">Not Paid</div>
                            }
                        </div>
                        {/* Order Items */}
                        <div>
                            <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">Order Items</h2>
                            {order.orderItems.map((item) => (
                                <div key={item._id || item.product} className="flex items-center gap-4 py-3 border-b last:border-b-0 dark:border-gray-700">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded flex-shrink-0"/>
                                    <div className="flex-grow">
                                        <Link to={`/product/${item.product}`} className="font-semibold hover:underline dark:text-gray-100">{item.name}</Link>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.qty} x {formatCurrency(item.price)}</p>
                                        {/* Return status */}
                                        {item.returnStatus && item.returnStatus !== 'None' && (
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ml-2 ${
                                                item.returnStatus === 'Requested' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                                item.returnStatus === 'Approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                                                item.returnStatus === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                                            }`}>
                                                Return {item.returnStatus}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-semibold dark:text-gray-100">{formatCurrency(item.qty * item.price)}</p>
                                        {isBuyer && item.returnStatus === 'None' && order.isDelivered && (
                                            <button
                                                onClick={() => handleOpenReturnModal(item)}
                                                className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1 dark:text-blue-400"
                                                title="Request Return"
                                            >
                                                <RotateCcw size={12}/> Return Item
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Summary */}
                    <div className="md:col-span-1">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg shadow-inner sticky top-8">
                            <h2 className="text-xl md:text-2xl font-bold mb-4 border-b pb-2 dark:border-gray-600 dark:text-gray-100">Order Summary</h2>
                            <div className="space-y-2 text-sm md:text-base">
                                <div className="flex justify-between"><span>Items</span><span className="font-medium dark:text-gray-100">{formatCurrency(order.itemsPrice)}</span></div>
                                <div className="flex justify-between"><span>Shipping</span><span className="font-medium dark:text-gray-100">{formatCurrency(order.shippingPrice)}</span></div>
                                <div className="flex justify-between"><span>Tax</span><span className="font-medium dark:text-gray-100">{formatCurrency(order.taxPrice)}</span></div>
                                <div className="flex justify-between font-bold text-lg md:text-xl border-t pt-2 mt-2 dark:border-gray-600">
                                    <span>Total</span><span className="text-primary dark:text-primary-light">{formatCurrency(order.totalPrice)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print-only (hidden) component for export */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <OrderToPrint ref={componentToPrintRef} order={order} />
            </div>

            {/* Toast Notifications */}
            {toast.show && <NotificationToast message={toast.message} type={toast.type} onClose={() => setToast({ show: false })} />}

            {/* Return Request Modal */}
            <ConfirmationModal
                isOpen={showReturnModal}
                onClose={() => setShowReturnModal(false)}
                onConfirm={handleReturnSubmit}
                title={`Request Return for ${itemToReturn?.name || 'Item'}`}
                confirmButtonText={returnLoading ? <LoadingSpinner size="xs"/> : "Submit Request"}
                cancelButtonText="Cancel"
                isConfirmDisabled={returnLoading || !returnReason.trim()}
            >
                <div className="space-y-4 text-sm">
                    <p className="text-gray-600 dark:text-gray-300">Please provide a reason for returning this item.</p>
                    <textarea
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        rows="4"
                        className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-500 focus:ring-primary focus:border-primary"
                        placeholder="e.g., Item damaged, Wrong item received, Changed mind..."
                        maxLength={200}
                    />
                    <p className="text-xs text-gray-400 text-right">{returnReason.length}/200</p>
                </div>
            </ConfirmationModal>
        </>
    );
};

// Print-only component, receives order as a prop
const OrderToPrint = React.forwardRef(({ order }, ref) => (
    <div ref={ref} style={{ padding: 24, fontFamily: 'Arial, sans-serif', color: '#000' }}>
        <h1 style={{ marginBottom: 8 }}>Order #{order._id}</h1>
        <section style={{ marginBottom: 12 }}>
            <h2 style={{ marginBottom: 4 }}>Customer</h2>
            <div><strong>Name:</strong> {order.user?.name}</div>
            <div><strong>Email:</strong> {order.user?.email}</div>
            <div>
                <strong>Address:</strong> {order.shippingAddress
                    ? `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`
                    : 'N/A'}
            </div>
        </section>
        <section style={{ marginBottom: 12 }}>
            <h2 style={{ marginBottom: 4 }}>Items</h2>
            <ul style={{ paddingLeft: 18 }}>
                {order.orderItems?.map(item => (
                    <li key={item.product} style={{ marginBottom: 6 }}>
                        {item.name} — {item.qty} x {formatCurrency(item.price)} = {formatCurrency(item.qty * item.price)}
                    </li>
                ))}
            </ul>
        </section>
        <section>
            <h2 style={{ marginBottom: 4 }}>Summary</h2>
            <div><strong>Items:</strong> {formatCurrency(order.itemsPrice)}</div>
            <div><strong>Shipping:</strong> {formatCurrency(order.shippingPrice)}</div>
            <div><strong>Tax:</strong> {formatCurrency(order.taxPrice)}</div>
            <div style={{ marginTop: 8, fontWeight: 'bold' }}><strong>Total:</strong> {formatCurrency(order.totalPrice)}</div>
        </section>
    </div>
));

export default OrderDetailsPage;
