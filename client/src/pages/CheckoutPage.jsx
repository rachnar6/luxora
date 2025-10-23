// src/pages/CheckoutPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
// Assuming these service functions correctly interact with your backend
import { addOrderItems, createRazorpayOrder, getRazorpayKeyId } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import NotificationToast from '../components/common/NotificationToast';
import AddressModal from '../components/common/AddressModal';
import { CreditCard, Truck, Wallet, Edit } from 'lucide-react';

// --- Helper Functions ---
const formatCurrency = (value) => {
    const numericValue = Number(value);
    if (isNaN(numericValue)) return '₹0.00';
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2, // Ensure 2 decimal places
        maximumFractionDigits: 2,
    }).format(numericValue);
};

// --- Shipping Rates (Example - Ensure this matches your logic) ---
const shippingRates = {
    // Cities (lowercase)
    'mumbai': 40, 'delhi': 45, 'chennai': 50, 'kolkata': 55,
    'bangalore': 50, 'hyderabad': 50, 'madurai': 60,
    // Countries (lowercase)
    'india': 75,
    'united states': 500, 'uk': 450,
};
const DEFAULT_SHIPPING_RATE = 100; // Fallback rate
const FREE_SHIPPING_THRESHOLD = 2000; // Example threshold

// --- Component ---
const CheckoutPage = () => {
    const navigate = useNavigate();
    // Assuming loadCart exists in context to ensure cart is loaded
    const { cartItems, loading: cartLoading, shippingAddress, clearCart, savePaymentMethod } = useCart();
    const { user, token } = useAuth();

    // State Variables
    const [paymentMethod, setPaymentMethod] = useState('Razorpay');
    const [loading, setLoading] = useState(false); // For payment process/order creation
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('info');
    const [razorpayKeyId, setRazorpayKeyId] = useState('');
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [keyLoading, setKeyLoading] = useState(true); // For loading Razorpay key

    // --- Price Calculations (Memoized for Display) ---
    const displayPrices = useMemo(() => {
        const items = cartItems.reduce((acc, item) => {
             const price = Number(item.product?.price) || 0;
             const qty = Number(item.qty) || 0;
             return acc + (price * qty);
        }, 0);

        let shipping = DEFAULT_SHIPPING_RATE;
        if (shippingAddress?.address) {
             if (items >= FREE_SHIPPING_THRESHOLD) { // Use >= for threshold
                 shipping = 0;
             } else {
                 const city = (shippingAddress.city || '').toLowerCase().trim();
                 const country = (shippingAddress.country || '').toLowerCase().trim();
                 shipping = shippingRates[city] || shippingRates[country] || DEFAULT_SHIPPING_RATE;
             }
        }

        const tax = 0.18 * items; // 18% Tax
        const total = items + shipping + tax;
        return { items, shipping, tax, total };
    }, [cartItems, shippingAddress]);

    // --- Effects ---
    // Load cart and check authentication/cart status
    useEffect(() => {
        if (!user && !cartLoading) { // Redirect only if not loading auth/cart
            navigate('/login?redirect=/checkout');
        }
        if (!cartLoading && cartItems.length === 0 && user) {
             console.log("Cart is empty, navigating back to cart page.");
             navigate('/cart');
        }
    }, [user, cartItems.length, cartLoading, navigate]); // Use cartItems.length

    // Fetch Razorpay Key
    useEffect(() => {
        const fetchRazorpayKey = async () => {
            console.log("Attempting to fetch Razorpay key...");
            setKeyLoading(true);
            try {
                if (token) {
                    const key = await getRazorpayKeyId(token);
                    if (!key) throw new Error("Received empty Key ID from backend.");
                    setRazorpayKeyId(key);
                    console.log("Razorpay Key ID fetched successfully.");
                } else if (user) {
                     throw new Error("Auth token missing.");
                }
            } catch (error) {
                console.error("Failed to fetch Razorpay Key ID:", error);
                setToastMessage(`Failed to load payment gateway: ${error.message}`);
                setToastType("error");
                setShowToast(true);
            } finally {
                 setKeyLoading(false);
            }
        };

        if(user && token){ fetchRazorpayKey(); }
        else { setKeyLoading(false); } // Stop loading if no user/token

    }, [user, token]);

    // --- Handlers ---
    const paymentHandler = useCallback(async (e) => {
        e.preventDefault();

        // **Input Validations**
        if (!shippingAddress?.address) {
            setToastMessage("Please select a shipping address."); setToastType("error"); setShowToast(true); return;
        }
        if (keyLoading || !razorpayKeyId) {
             setToastMessage("Payment gateway is not ready. Please wait or refresh."); setToastType("error"); setShowToast(true); return;
        }
        if (cartItems.length === 0) {
             setToastMessage("Your cart is empty."); setToastType("error"); setShowToast(true); return;
        }

        setLoading(true); // Start payment process loading
        savePaymentMethod(paymentMethod);

        try {
            // **Recalculate Prices Just Before Payment**
            const finalItemsPrice = cartItems.reduce((acc, item) => acc + (Number(item.product?.price) || 0) * (Number(item.qty) || 0), 0);
            let finalShippingPrice = DEFAULT_SHIPPING_RATE;
            if (shippingAddress?.address) {
                if (finalItemsPrice >= FREE_SHIPPING_THRESHOLD) finalShippingPrice = 0;
                else {
                    const city = (shippingAddress.city || '').toLowerCase().trim();
                    const country = (shippingAddress.country || '').toLowerCase().trim();
                    finalShippingPrice = shippingRates[city] || shippingRates[country] || DEFAULT_SHIPPING_RATE;
                }
            }
            const finalTaxPrice = 0.18 * finalItemsPrice;
            // Ensure total is calculated correctly
            const finalTotalPrice = finalItemsPrice + finalShippingPrice + finalTaxPrice;

            console.log("[PaymentHandler] Final Prices Calculated:", { finalItemsPrice, finalShippingPrice, finalTaxPrice, finalTotalPrice });

            // **Create Razorpay Order on Backend**
            // Send the amount in BASE currency (INR). Backend MUST multiply by 100.
            console.log(`[PaymentHandler] Sending amount ${finalTotalPrice} to createRazorpayOrder`);
            const razorpayOrder = await createRazorpayOrder({ amount: finalTotalPrice }, token);
            console.log("[PaymentHandler] Razorpay Order Created (Backend Response):", razorpayOrder);

            if (!razorpayOrder || !razorpayOrder.id || !razorpayOrder.amount) {
                 throw new Error("Failed to create Razorpay order ID or invalid response from backend.");
            }

            // **Razorpay Checkout Options**
const options = {
    key: razorpayKeyId,
    amount: razorpayOrder.amount, // Use amount (in paise) from backend response
    currency: razorpayOrder.currency || "INR",
    name: "Luxora",
    description: "E-commerce Transaction",
    order_id: razorpayOrder.id, // ID from backend response
    // **Success Handler**
    handler: async function (response) {
        console.log("[Razorpay Handler] Payment Success Response:", response);
        setLoading(true); // Show loading while saving order to DB

        // --- Recalculate prices accurately JUST BEFORE sending ---
        // (Ensure cartItems reflects the state at the time of checkout)
        const finalItemsPrice = cartItems.reduce((acc, item) => {
            const price = Number(item.product?.price) || 0;
            const qty = Number(item.qty) || 0;
            return acc + (price * qty);
        }, 0);

        let finalShippingPrice = DEFAULT_SHIPPING_RATE; // Use the constant defined earlier
        if (shippingAddress?.address) {
            if (finalItemsPrice >= FREE_SHIPPING_THRESHOLD) { // Use the constant
                finalShippingPrice = 0;
            } else {
                const city = (shippingAddress.city || '').toLowerCase().trim();
                const country = (shippingAddress.country || '').toLowerCase().trim();
                finalShippingPrice = shippingRates[city] || shippingRates[country] || DEFAULT_SHIPPING_RATE;
            }
        }
        const finalTaxPrice = 0.18 * finalItemsPrice; // 18% Tax
        const finalTotalPrice = finalItemsPrice + finalShippingPrice + finalTaxPrice;
        // --- End Recalculation ---

        // Prepare order data for your backend
        const orderData = {
            orderItems: cartItems.map(item => ({
                name: item.product.name, // Send necessary fields
                qty: item.qty,
                image: item.product.image,
                price: item.product.price,
                product: item.product._id // Send only the product ID
            })),
            shippingAddress,
            paymentMethod,
            itemsPrice: finalItemsPrice, // Send recalculated price
            taxPrice: finalTaxPrice,
            shippingPrice: finalShippingPrice,
            totalPrice: finalTotalPrice, // Send recalculated total
            paymentResult: { // Store essential Razorpay success details
                id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id, // Store Razorpay order ID
                signature: response.razorpay_signature, // Store signature for potential verification
                status: 'COMPLETED', // Indicate payment success
            },
        };

        try {
            // Log the data being sent to your backend
            console.log("Submitting Order Data to Backend:", JSON.stringify(orderData, null, 2));

            // Call your backend service to save the order
            const newOrder = await addOrderItems(orderData, token);
            console.log("[Razorpay Handler] Order Saved:", newOrder);

            clearCart(); // Clear cart after successful order save
            navigate(`/order/${newOrder._id}`); // Navigate to order confirmation page

        } catch (orderError) {
            console.error("[Razorpay Handler] Failed to save order:", orderError);
            // Show error to the user
            setToastMessage(orderError.response?.data?.message || 'Failed to save order after payment. Please contact support.');
            setToastType('error');
            setShowToast(true);
            setLoading(false); // Stop loading indicator on error
        }
        // Do not setLoading(false) here on success as we navigate away; errors above stop loading.
    }
};

// Open Razorpay checkout
if (typeof window !== 'undefined' && window.Razorpay) {
    const rzp = new window.Razorpay(options);
    rzp.open();
} else {
    throw new Error("Razorpay SDK not loaded");
}
        } catch (error) {
            console.error("[PaymentHandler] Error:", error);
            setToastMessage(error.response?.data?.message || error.message || "Payment failed. Please try again.");
            setToastType("error");
            setShowToast(true);
        } finally {
            // Ensure loading state is cleared unless navigation occurs
            setLoading(false);
        }
    }, [cartItems, shippingAddress, token, razorpayKeyId, paymentMethod, keyLoading, savePaymentMethod, clearCart, navigate]);

    // --- Render ---
    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto my-8 dark:bg-gray-800">
                {/* Header */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 text-center flex items-center justify-center gap-3 dark:text-gray-100">
                    <CreditCard className="w-7 h-7 md:w-8 md:h-8 text-primary" /> Checkout
                </h1>

                {/* Main Grid */}
                <form onSubmit={paymentHandler} className="grid md:grid-cols-5 gap-8">
                    {/* Left Column: Shipping & Payment */}
                    <div className="md:col-span-3 space-y-6 md:space-y-8">
                        {/* Shipping Address Section */}
                        <div className="border rounded-xl p-4 md:p-6 shadow-sm dark:border-gray-700">
                            {/* ... Address display and 'Change' button ... */}
                             <div className="flex justify-between items-center mb-4">
                                 <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2 dark:text-gray-100">
                                     <Truck className="w-5 h-5 md:w-6 md:h-6 text-gray-500 dark:text-gray-400" /> Shipping Address
                                 </h2>
                                 <button type="button" onClick={() => setIsAddressModalOpen(true)} className="flex items-center gap-1 text-sm text-primary font-semibold hover:underline dark:text-primary-light dark:hover:text-primary">
                                     <Edit size={14} /> {shippingAddress?.address ? 'Change' : 'Select Address'}
                                 </button>
                             </div>
                             {shippingAddress?.address ? (
                                 <div className="text-gray-700 space-y-1 dark:text-gray-300 text-sm md:text-base">
                                     <p className="font-semibold">{shippingAddress.name || user?.name}</p>
                                     <p>{shippingAddress.address}</p>
                                     <p>{`${shippingAddress.city}, ${shippingAddress.postalCode}`}</p>
                                     <p>{shippingAddress.country}</p>
                                     {shippingAddress.phone && <p>Phone: {shippingAddress.phone}</p>}
                                 </div>
                             ) : (
                                 <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base italic">Please select or add a shipping address.</p>
                             )}
                        </div>

                        {/* Payment Method Section */}
                        <div className="border rounded-xl p-4 md:p-6 shadow-sm dark:border-gray-700">
                            {/* ... Payment method selection (Razorpay) ... */}
                             <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 dark:text-gray-100">
                                <Wallet className="w-5 h-5 md:w-6 md:h-6 text-gray-500 dark:text-gray-400" /> Payment Method
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center p-3 border rounded-lg dark:border-gray-600 has-[:checked]:bg-primary-light has-[:checked]:border-primary dark:has-[:checked]:bg-gray-700">
                                    <input type="radio" id="razorpay" name="paymentMethod" value="Razorpay" checked={paymentMethod === 'Razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="h-4 w-4 md:h-5 md:w-5 text-primary focus:ring-primary border-gray-400 dark:border-gray-500"/>
                                    <label htmlFor="razorpay" className="ml-3 text-base md:text-lg text-gray-700 dark:text-gray-300 cursor-pointer">
                                        Razorpay <span className="text-sm text-gray-500 dark:text-gray-400">(Card, UPI, Net Banking, Wallet)</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="md:col-span-2 bg-gray-50 rounded-xl p-4 md:p-6 flex flex-col dark:bg-gray-700/50">
                        {/* ... Order summary details (use displayPrices) ... */}
                         <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 border-b pb-3 dark:text-gray-100 dark:border-gray-600">Order Summary</h2>
                        <div className="space-y-2 text-base md:text-lg text-gray-700 flex-grow dark:text-gray-300">
                            <div className="flex justify-between">
                                <span>Items Total:</span>
                                <span className="font-semibold">{formatCurrency(displayPrices.items)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping:</span>
                                <span className="font-semibold">{displayPrices.shipping === 0 ? 'FREE' : formatCurrency(displayPrices.shipping)}</span>
                            </div>
                            <div className="flex justify-between pb-2 border-b dark:border-gray-600">
                                <span>Tax (18%):</span>
                                <span className="font-semibold">{formatCurrency(displayPrices.tax)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg md:text-xl pt-2 mt-2">
                                <span>Order Total:</span>
                                <span className="text-primary dark:text-primary-light">{formatCurrency(displayPrices.total)}</span>
                            </div>
                        </div>
                        {/* Place Order Button */}
                        <button
                            type="submit"
                            className="w-full mt-8 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold text-base md:text-lg hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={loading || keyLoading || cartItems.length === 0 || !shippingAddress?.address || !razorpayKeyId}
                            title={!shippingAddress?.address ? "Please select shipping address" : (keyLoading || !razorpayKeyId) ? "Payment gateway loading..." : ""}
                        >
                            {loading ? <LoadingSpinner size="sm" /> : <><CreditCard className="w-5 h-5" /> Proceed to Pay</>}
                        </button>
                         {keyLoading && <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">Loading payment gateway...</p>}
                         {!keyLoading && !razorpayKeyId && user && token && <p className="text-xs text-red-500 text-center mt-2">Payment gateway failed to load. Please refresh.</p>}
                         {!shippingAddress?.address && <p className="text-xs text-red-500 text-center mt-2">Please select shipping address</p>}
                    </div>
                </form>
            </div>

            {/* Modals and Toasts */}
            {showToast && ( <NotificationToast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} /> )}
            {isAddressModalOpen && <AddressModal onClose={() => setIsAddressModalOpen(false)} />}
        </>
    );
};

export default CheckoutPage;