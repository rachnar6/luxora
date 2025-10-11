import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { addOrderItems, createRazorpayOrder, getRazorpayKeyId } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import NotificationToast from '../components/common/NotificationToast';
import AddressModal from '../components/common/AddressModal';
import { CreditCard, Truck, Wallet, Edit } from 'lucide-react';

const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(value);
};

const shippingRates = {
    'mumbai': 40, 'delhi': 45, 'chennai': 50, 'kolkata': 55,
    'bangalore': 50, 'hyderabad': 50, 'madurai': 60,
    'india': 75, 'united states': 500, 'uk': 450,
};

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cartItems, loading: cartLoading, shippingAddress, clearCart, savePaymentMethod } = useCart();
    const { user, token } = useAuth();
    
    const [paymentMethod, setPaymentMethod] = useState('Razorpay');
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('info');
    const [razorpayKeyId, setRazorpayKeyId] = useState('');
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

    const shippingPrice = useMemo(() => {
        if (!shippingAddress) return 100;
        if (itemsPrice > 2000) return 0;
        const city = (shippingAddress.city || '').toLowerCase().trim();
        const country = (shippingAddress.country || '').toLowerCase().trim();
        if (shippingRates[city]) return shippingRates[city];
        if (shippingRates[country]) return shippingRates[country];
        return 100;
    }, [itemsPrice, shippingAddress]);

    const taxPrice = 0.18 * itemsPrice;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    useEffect(() => {
        if (!user) {
            navigate('/login?redirect=/checkout');
        }
        if (!cartLoading && cartItems.length === 0) {
            navigate('/cart');
        }
        const fetchRazorpayKey = async () => {
            try {
                if(token) {
                    const key = await getRazorpayKeyId(token);
                    setRazorpayKeyId(key);
                }
            } catch (error) {
                console.error("Failed to fetch Razorpay Key ID", error);
            }
        };
        fetchRazorpayKey();
    }, [cartItems, cartLoading, navigate, user, token]);

    const paymentHandler = async (e) => {
        e.preventDefault();
        
        if (!shippingAddress || !shippingAddress.address) {
            setToastMessage("Please select a shipping address before proceeding.");
            setToastType("error");
            setShowToast(true);
            return;
        }

        setLoading(true);
        savePaymentMethod(paymentMethod);

        try {
            const razorpayOrder = await createRazorpayOrder({ amount: Math.round(totalPrice * 100) }, token);
            const options = {
                key: razorpayKeyId,
                amount: razorpayOrder.amount,
                currency: "INR",
                name: "Luxora",
                description: "E-commerce Transaction",
                order_id: razorpayOrder.id,
                handler: async function (response) {
                    const orderData = {
                        orderItems: cartItems.map(item => ({...item, product: item.product })),
                        shippingAddress,
                        paymentMethod,
                        itemsPrice, taxPrice, shippingPrice, totalPrice,
                        paymentResult: {
                            id: response.razorpay_payment_id,
                            status: 'COMPLETED',
                            email_address: user.email,
                        },
                    };
                    
                    const newOrder = await addOrderItems(orderData, token);
                    clearCart();
                    navigate(`/order/${newOrder._id}`);
                },
                prefill: { name: user.name, email: user.email },
                theme: { color: "#FF6F61" },
            };
            
            const rzp = new window.Razorpay(options);
            rzp.open();
            setLoading(false);

        } catch (err) {
            setToastMessage(err.response?.data?.message || 'Failed to initiate payment.');
            setToastType('error');
            setShowToast(true);
            setLoading(false);
        }
    };

    if (cartLoading) {
        return <LoadingSpinner />;
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto my-8 dark:bg-gray-800">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center flex items-center justify-center gap-3 dark:text-gray-100">
                    <CreditCard className="w-8 h-8 text-primary" /> Checkout
                </h1>

                <form onSubmit={paymentHandler} className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-8">
                        <div className="border rounded-xl p-6 shadow-sm dark:border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 dark:text-gray-100">
                                    <Truck className="w-6 h-6 text-gray-500 dark:text-gray-400" /> Shipping Address
                                </h2>
                                <button type="button" onClick={() => setIsAddressModalOpen(true)} className="flex items-center gap-1 text-sm text-primary font-semibold hover:underline">
                                    <Edit size={16} /> {shippingAddress ? 'Change' : 'Select Address'}
                                </button>
                            </div>
                            {shippingAddress ? (
                                <div className="text-gray-700 space-y-1 dark:text-gray-300">
                                    <p className="font-semibold">{shippingAddress.address}</p>
                                    <p>{`${shippingAddress.city}, ${shippingAddress.postalCode}`}</p>
                                    <p>{shippingAddress.country}</p>
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">Please select a shipping address.</p>
                            )}
                        </div>
                        
                        <div className="border rounded-xl p-6 shadow-sm dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 dark:text-gray-100">
                                <Wallet className="w-6 h-6 text-gray-500 dark:text-gray-400" /> Payment Method
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <input type="radio" id="razorpay" name="paymentMethod" value="Razorpay" checked={paymentMethod === 'Razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="h-5 w-5 text-primary focus:ring-primary"/>
                                    <label htmlFor="razorpay" className="ml-3 text-lg text-gray-700 dark:text-gray-300">Razorpay (Card, UPI, Net Banking)</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 flex flex-col dark:bg-gray-700/50">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 dark:text-gray-100 dark:border-gray-600">Order Summary</h2>
                        <div className="space-y-2 text-lg text-gray-700 flex-grow dark:text-gray-300">
                            <div className="flex justify-between">
                                <span>Items:</span>
                                <span className="font-semibold">{formatCurrency(itemsPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping:</span>
                                <span className="font-semibold">{formatCurrency(shippingPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax:</span>
                                <span className="font-semibold">{formatCurrency(taxPrice)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-xl border-t pt-2 mt-2 dark:border-gray-600">
                                <span>Order Total:</span>
                                <span className="text-primary">{formatCurrency(totalPrice)}</span>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full mt-8 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold text-lg hover:bg-green-600 transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || cartItems.length === 0}
                        >
                            {loading ? <LoadingSpinner /> : <><CreditCard className="w-5 h-5" /> Proceed to Pay</>}
                        </button>
                    </div>
                </form>
            </div>
            
            {showToast && (
                <NotificationToast
                    message={toastMessage}
                    type={toastType}
                    onClose={() => setShowToast(false)}
                />
            )}

            {isAddressModalOpen && <AddressModal onClose={() => setIsAddressModalOpen(false)} />}
        </>
    );
};

export default CheckoutPage;

