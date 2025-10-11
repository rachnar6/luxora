// client/src/components/common/NotificationToast.jsx
// Simple Notification/Toast component (can be enhanced with state management for multiple toasts)

import React, { useState, useEffect } from 'react';
import { XCircle, CheckCircle, Info } from 'lucide-react';

const NotificationToast = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, 3000); // Auto-hide after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  let bgColor = 'bg-blue-500';
  let icon = <Info className="w-5 h-5" />;

  switch (type) {
    case 'success':
      bgColor = 'bg-green-500';
      icon = <CheckCircle className="w-5 h-5" />;
      break;
    case 'error':
      bgColor = 'bg-red-500';
      icon = <XCircle className="w-5 h-5" />;
      break;
    case 'info':
    default:
      bgColor = 'bg-blue-500';
      icon = <Info className="w-5 h-5" />;
      break;
  }

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 z-50 animate-fade-in-up`}>
      {icon}
      <span>{message}</span>
      <button onClick={() => setIsVisible(false)} className="ml-4 text-white hover:text-gray-200">
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  );
};

export default NotificationToast;
