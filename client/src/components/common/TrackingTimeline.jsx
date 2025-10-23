// client/src/components/common/TrackingTimeline.jsx

import React from 'react';
import { Package, Truck, Home } from 'lucide-react';

const statusConfig = {
    Processing: { icon: <Package size={20}/>, text: "Order is being processed." },
    Shipped: { icon: <Truck size={20}/>, text: "Your order has been shipped." },
    'Out for Delivery': { icon: <Truck size={20}/>, text: "Your order is out for delivery." },
    Delivered: { icon: <Home size={20}/>, text: "Your order has been delivered." },
};

const TrackingTimeline = ({ history }) => {
    if (!history || history.length === 0) {
        return null;
    }

    return (
        <div className="border-b pb-4 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Order Tracking</h2>
            <div className="relative pl-8">
                {/* The vertical line */}
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-600"></div>

                {history.map((item, index) => {
                    const config = statusConfig[item.status] || { icon: <Package size={20}/>, text: item.status };
                    const isLatest = index === 0;

                    return (
                        <div key={item._id} className="relative mb-6">
                            <div className={`absolute -left-1 top-1 w-10 h-10 rounded-full flex items-center justify-center
                                ${isLatest ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}>
                                {config.icon}
                            </div>
                            <div className={`ml-12 ${isLatest ? 'font-bold' : ''}`}>
                                <p className={isLatest ? 'text-primary' : 'text-gray-800 dark:text-gray-200'}>{item.status}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{config.text}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(item.updatedAt).toLocaleString()}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TrackingTimeline;