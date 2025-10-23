import React from 'react';

const formatCurrency = (value) => {
    // Add a safety check here as well
    if (typeof value !== 'number') return '₹0.00';
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(value);
};

export const OrderToPrint = React.forwardRef(({ order }, ref) => {
    // ✅ THIS IS THE FIX: The `if (!order) return null;` line has been removed.
    // The main div will now always render, allowing the ref to attach.

    return (
        <div ref={ref} className="p-10">
            {/* We add a check here to only show content when the order exists */}
            {order && (
                <>
                    <h1 className="text-3xl font-bold mb-2">Order Summary</h1>
                    <p className="text-gray-500 mb-6">Order ID: {order._id}</p>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Shipping To:</h2>
                            <p>{order.user.name}</p>
                            <p>{order.shippingAddress.address}</p>
                            <p>{`${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`}</p>
                            <p>{order.shippingAddress.country}</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Order Details:</h2>
                            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                            <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                            <p><strong>Status:</strong> {order.isPaid ? 'Paid' : 'Not Paid'}</p>
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold mb-4">Items Ordered</h2>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="border-b-2 p-2">Product</th>
                                <th className="border-b-2 p-2 text-center">Quantity</th>
                                <th className="border-b-2 p-2 text-right">Price</th>
                                <th className="border-b-2 p-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.orderItems.map((item) => (
                                <tr key={item.product}>
                                    <td className="border-b p-2">{item.name}</td>
                                    <td className="border-b p-2 text-center">{item.qty}</td>
                                    <td className="border-b p-2 text-right">{formatCurrency(item.price)}</td>
                                    <td className="border-b p-2 text-right">{formatCurrency(item.qty * item.price)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="w-1/3 ml-auto mt-6">
                        <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(order.itemsPrice)}</span></div>
                        <div className="flex justify-between"><span>Shipping:</span><span>{formatCurrency(order.shippingPrice)}</span></div>
                        <div className="flex justify-between"><span>Tax:</span><span>{formatCurrency(order.taxPrice)}</span></div>
                        <div className="flex justify-between font-bold text-xl border-t mt-2 pt-2">
                            <span>Total:</span><span>{formatCurrency(order.totalPrice)}</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
});