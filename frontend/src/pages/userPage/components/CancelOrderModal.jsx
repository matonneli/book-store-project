import React from 'react';

function CancelOrderModal({ isOpen, order, onConfirm, onCancel, isLoading }) {
    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h3
                        className="text-2xl font-bold text-[#321d4f] mb-2"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                        Cancel Order?
                    </h3>
                    <p
                        className="text-gray-600"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        Are you sure you want to cancel order <strong>#{order.orderId}</strong>?
                    </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p
                        className="text-sm text-yellow-800 mb-2"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        <strong>⚠️ Important:</strong>
                    </p>
                    <ul
                        className="text-xs text-yellow-700 space-y-1 list-disc list-inside"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        <li>This action cannot be undone</li>
                        <li>Items will be returned to stock</li>
                        {order.paidAt && (
                            <li>You can request a refund after cancellation</li>
                        )}
                    </ul>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        No, Keep Order
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Cancelling...
                            </>
                        ) : (
                            'Yes, Cancel Order'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CancelOrderModal;