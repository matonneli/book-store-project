import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import ReviewModal from './ReviewModal';

function OrderItemList({ orderId, orderDetails, loadingDetails, onBookClick }) {
    const [reviewStatuses, setReviewStatuses] = useState({});
    const [loadingReviewStatus, setLoadingReviewStatus] = useState(new Set());
    const [reviewModal, setReviewModal] = useState({
        isOpen: false,
        bookId: null,
        bookTitle: '',
        authorName: ''
    });

    const { authToken } = useAuth();

    // Load review statuses for all books when order details are loaded
    useEffect(() => {
        if (orderDetails?.items && orderDetails.items.length > 0) {
            orderDetails.items.forEach(item => {
                if (!reviewStatuses[item.bookId] && !loadingReviewStatus.has(item.bookId)) {
                    checkReviewStatus(item.bookId);
                }
            });
        }
    }, [orderDetails]);

    const checkReviewStatus = async (bookId) => {
        if (loadingReviewStatus.has(bookId)) return;

        setLoadingReviewStatus(prev => new Set([...prev, bookId]));

        try {
            const response = await fetch(`/api/reviews/can-review/${bookId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setReviewStatuses(prev => ({
                    ...prev,
                    [bookId]: data
                }));
            }
        } catch (error) {
            console.error('Error checking review status:', error);
        } finally {
            setLoadingReviewStatus(prev => {
                const newSet = new Set(prev);
                newSet.delete(bookId);
                return newSet;
            });
        }
    };

    const openReviewModal = (item) => {
        setReviewModal({
            isOpen: true,
            bookId: item.bookId,
            bookTitle: item.bookTitle,
            authorName: item.authorFullName
        });
    };

    const closeReviewModal = () => {
        setReviewModal({
            isOpen: false,
            bookId: null,
            bookTitle: '',
            authorName: ''
        });

        // Refresh review status after closing modal (in case review was added)
        if (reviewModal.bookId) {
            setTimeout(() => {
                checkReviewStatus(reviewModal.bookId);
            }, 500);
        }
    };

    const getItemStatusBadge = (status) => {
        const statusConfig = {
            PENDING: {
                color: 'bg-yellow-100 text-yellow-800',
                text: 'Pending'
            },
            DELIVERED: {
                color: 'bg-green-100 text-green-800',
                text: 'Delivered'
            },
            RENTED: {
                color: 'bg-blue-100 text-blue-800',
                text: 'Rented'
            },
            OVERDUE: {
                color: 'bg-red-100 text-red-800',
                text: 'Overdue'
            }
        };

        const config = statusConfig[status] || {
            color: 'bg-gray-100 text-gray-800',
            text: status
        };

        return (
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    };

    const getItemTypeLabel = (type) => {
        return type === 'RENT' ? 'Rented' : 'Purchased';
    };

    const formatDateTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderReviewSection = (item) => {
        const bookId = item.bookId;
        const reviewStatus = reviewStatuses[bookId];
        const isLoadingStatus = loadingReviewStatus.has(bookId);

        if (isLoadingStatus) {
            return (
                <div className="mt-3 flex items-center gap-2">
                    <div className="animate-spin h-3 w-3 border border-gray-400 border-t-transparent rounded-full"></div>
                    <span
                        className="text-xs text-gray-500"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        Loading review status...
                    </span>
                </div>
            );
        }

        if (!reviewStatus) return null;

        if (!reviewStatus.hasPurchased) {
            return (
                <div className="mt-3">
                    <span
                        className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        Purchase required to review
                    </span>
                </div>
            );
        }

        if (reviewStatus.hasReviewed) {
            return (
                <div className="mt-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span
                            className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                            ✓ You reviewed this book
                        </span>
                        {reviewStatus.existingReview && (
                            <span
                                className="text-xs text-gray-600 flex items-center gap-1"
                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                            >
                                <span className="text-yellow-500">⭐</span>
                                {reviewStatus.existingReview.rating}/5
                            </span>
                        )}
                    </div>
                </div>
            );
        }

        if (reviewStatus.canReview) {
            return (
                <div className="mt-3">
                    <button
                        onClick={() => openReviewModal(item)}
                        className="text-xs bg-[#321d4f] text-white px-3 py-1.5 rounded-full hover:bg-[#4a2870] transition-colors font-medium"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        Add Review
                    </button>
                </div>
            );
        }

        return null;
    };

    if (loadingDetails) {
        return (
            <div className="flex justify-center items-center py-4">
                <svg className="animate-spin h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-600" style={{ fontFamily: "'Montserrat', sans-serif" }}>Loading items...</span>
            </div>
        );
    }

    if (!orderDetails || !orderDetails.items || orderDetails.items.length === 0) {
        return (
            <p
                className="text-center text-gray-600 py-4"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
                No items found or failed to load.
            </p>
        );
    }

    return (
        <>
            <div
                className="mt-6 border-t pt-6 overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                    maxHeight: orderDetails.items.length * 300 + 100,
                    opacity: 1,
                    transform: 'translateY(0)',
                    transitionProperty: 'max-height, opacity, transform'
                }}
            >
                <h4
                    className="text-lg font-semibold mb-4 text-[#321d4f]"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                    Order Items
                </h4>
                <div className="space-y-6">
                    {orderDetails.items.map((item) => (
                        <div
                            key={item.orderItemId}
                            className="flex gap-4 pb-4 border-b last:border-b-0"
                        >
                            <div
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => onBookClick(`/book/${item.bookId}`)}
                            >
                                <img
                                    src={item.imageUrl || 'https://via.placeholder.com/128x192?text=Book+Cover'}
                                    alt={item.bookTitle}
                                    className="w-32 h-48 object-cover rounded-lg shadow-md"
                                />
                            </div>
                            <div className="flex-1">
                                <div
                                    className="cursor-pointer hover:text-[#4a2870] transition-colors"
                                    onClick={() => onBookClick(`/book/${item.bookId}`)}
                                >
                                    <h5
                                        className="text-lg font-semibold text-[#321d4f]"
                                        style={{ fontFamily: "'Poppins', sans-serif" }}
                                    >
                                        {item.bookTitle}
                                    </h5>
                                    <p
                                        className="text-sm text-gray-600"
                                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                                    >
                                        by {item.authorFullName}
                                    </p>
                                </div>

                                <p
                                    className="text-sm font-medium mt-2"
                                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                                >
                                    {getItemTypeLabel(item.type)}
                                </p>

                                {item.type === 'RENT' && (
                                    <div className="text-sm mt-1 space-y-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                        <p>Rental Days: {item.rentalDays || 'N/A'}</p>
                                    </div>
                                )}

                                <div className="mt-2">
                                    {getItemStatusBadge(item.itemStatus)}
                                </div>

                                {/* Review Section */}
                                {renderReviewSection(item)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Review Modal */}
            <ReviewModal
                isOpen={reviewModal.isOpen}
                onClose={closeReviewModal}
                bookId={reviewModal.bookId}
                bookTitle={reviewModal.bookTitle}
                authorName={reviewModal.authorName}
            />
        </>
    );
}

export default OrderItemList;