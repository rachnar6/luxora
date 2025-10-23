import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    onCancel,
    title,
    message,
    confirmButtonText = "Delete",
    cancelButtonText = "Cancel",
    children // ADD THIS LINE
}) => {
    if (!isOpen) return null;

    return (
        // Modal overlay
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300"
            onClick={onClose}
        >
            {/* Modal content - stop propagation to prevent closing when clicking inside */}
            <div
                className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm dark:bg-gray-800 animate-pop-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center mb-4">
                    <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full mr-4 flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100 flex-grow">{title}</h3>
                </div>

                {/* Modal Message */}
                {message &&
                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm md:text-base">{message}</p>
                }

                {/* -------- SHOW CHILDREN CONTENT HERE -------- */}
                {children}

                {/* Modal Buttons */}
                <div className="flex justify-end gap-3 md:gap-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors duration-200 text-sm md:text-base"
                    >
                        {cancelButtonText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 text-sm md:text-base"
                    >
                        {confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
