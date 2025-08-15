import React from 'react';
import { useNavigate } from 'react-router-dom';

function RentalItemList({ rentals, lastRentalElementRef, loadingMore, hasNext }) {
    const navigate = useNavigate();

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

    const handleBookClick = (bookId) => {
        navigate(`/book/${bookId}`);
    };

    return (
        <div className="space-y-6">
            {rentals.map((item, index) => (
                <div
                    key={item.orderItemId}
                    ref={index === rentals.length - 1 ? lastRentalElementRef : null}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                    <div
                        className="flex gap-4 cursor-pointer hover:bg-gray-50 transition p-2 rounded-md"
                        onClick={() => handleBookClick(item.bookId)}
                    >
                        <img
                            src={item.imageUrl || 'https://via.placeholder.com/128x192?text=Book+Cover'}
                            alt={item.bookTitle}
                            className="w-32 h-48 object-cover rounded-lg shadow-md"
                        />
                        <div className="flex-1">
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
                            <p
                                className="text-sm text-gray-600 mt-1"
                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                            >
                                Order #{item.orderId}
                            </p>
                            <p
                                className="text-sm font-medium mt-2"
                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                            >
                                Rental Days: {item.rentalDays || 'N/A'}
                            </p>
                            {item.itemStatus === 'PENDING' ? (
                                <p
                                    className="text-sm text-gray-600 mt-1"
                                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                                >
                                    Ожидает получения (даты аренды будут установлены после выдачи)
                                </p>
                            ) : (
                                <div className="text-sm mt-1 space-y-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                    <p>Start: {formatDateTime(item.rentalStartAt)}</p>
                                    <p>End: {formatDateTime(item.rentalEndAt)}</p>
                                </div>
                            )}
                            <div className="mt-2">
                                {getItemStatusBadge(item.itemStatus)}
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {loadingMore && (
                <div className="flex justify-center items-center py-8">
                    <div className="flex items-center gap-2 text-gray-600">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span style={{ fontFamily: "'Montserrat', sans-serif" }}>
                            Loading more rentals...
                        </span>
                    </div>
                </div>
            )}

            {!hasNext && rentals.length > 0 && (
                <div className="text-center py-8">
                    <p
                        className="text-gray-500 text-sm"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        You've seen all your rentals
                    </p>
                </div>
            )}
        </div>
    );
}

export default RentalItemList;