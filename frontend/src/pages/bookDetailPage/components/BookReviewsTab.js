import React, { useState, useEffect, useCallback, useRef } from 'react';

const BookReviewsTab = ({ bookId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');

    const [currentPage, setCurrentPage] = useState(0);
    const [hasNext, setHasNext] = useState(true);
    const [totalElements, setTotalElements] = useState(0);

    const observerRef = useRef(null);

    const fetchBookReviews = useCallback(async (page = 0, append = false, sort = 'newest') => {
        try {
            if (!append) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await fetch(`/api/catalog/books/${bookId}/reviews?page=${page}&size=10&sort=${sort}`, {
                method: 'GET',
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch reviews');
            }

            const data = await response.json();

            if (append) {
                setReviews(prev => [...prev, ...data.reviews]);
            } else {
                setReviews(data.reviews);
            }

            setCurrentPage(data.currentPage);
            setHasNext(data.hasNext);
            setTotalElements(data.totalElements);

        } catch (err) {
            setError('Failed to load reviews');
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [bookId]);

    const loadMore = useCallback(() => {
        if (!loadingMore && hasNext) {
            fetchBookReviews(currentPage + 1, true, sortOrder);
        }
    }, [loadingMore, hasNext, currentPage, sortOrder, fetchBookReviews]);

    const lastReviewElementRef = useCallback((node) => {
        if (loadingMore) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasNext && !loadingMore) {
                loadMore();
            }
        }, {
            threshold: 0.1
        });

        if (node) observerRef.current.observe(node);
    }, [loadingMore, hasNext, loadMore]);

    useEffect(() => {
        if (bookId) {
            fetchBookReviews(0, false, sortOrder);
        }
    }, [bookId, sortOrder, fetchBookReviews]);

    const handleSortChange = (newSort) => {
        setSortOrder(newSort);
        setCurrentPage(0);
        setHasNext(true);
        setReviews([]);
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={`${i <= rating ? 'text-yellow-500' : 'text-gray-300'} text-lg`}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="bg-white p-8 rounded-lg shadow">
                <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#321d4f]"></div>
                        <p className="mt-4 text-gray-600" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                            Loading reviews...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-8 rounded-lg shadow">
                <p className="text-center text-red-600 text-lg">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow">
            {/* Header с сортировкой */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2
                        className="text-2xl font-semibold text-[#321d4f]"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                        Reviews
                    </h2>
                    {totalElements > 0 && (
                        <p
                            className="text-gray-600 mt-2"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                            Total: {totalElements} review{totalElements !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {totalElements > 0 && (
                    <div className="flex items-center gap-2">
                        <span
                            className="text-sm text-gray-600"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                            Sort by:
                        </span>
                        <select
                            value={sortOrder}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#321d4f] focus:border-transparent"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                            <option value="highest">Highest rating</option>
                            <option value="lowest">Lowest rating</option>
                        </select>
                    </div>
                )}
            </div>

            {reviews.length === 0 ? (
                <div className="text-center py-12">
                    <p
                        className="text-lg text-gray-600 mb-4"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        No reviews yet for this book.
                    </p>
                    <p
                        className="text-sm text-gray-500"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        Be the first to share your thoughts! Buy or rent and dive in!
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review, index) => (
                        <div
                            key={review.reviewId}
                            ref={index === reviews.length - 1 ? lastReviewElementRef : null}
                            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4
                                            className="text-lg font-semibold text-[#321d4f]"
                                            style={{ fontFamily: "'Poppins', sans-serif" }}
                                        >
                                            {review.reviewerName}
                                        </h4>
                                        <div className="flex items-center gap-1">
                                            <div className="flex">
                                                {renderStars(review.rating)}
                                            </div>
                                            <span
                                                className="text-sm text-gray-500 ml-1"
                                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                                            >
                                                {review.rating}/5
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <span
                                    className="text-sm text-gray-500"
                                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                                >
                                    {formatDate(review.createdAt)}
                                </span>
                            </div>

                            {review.comment && (
                                <div className="mb-4">
                                    <p
                                        className="text-gray-700 leading-relaxed"
                                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                                    >
                                        "{review.comment}"
                                    </p>
                                </div>
                            )}


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
                                    Loading more reviews...
                                </span>
                            </div>
                        </div>
                    )}

                    {!hasNext && reviews.length > 0 && (
                        <div className="text-center py-8">
                            <p
                                className="text-gray-500 text-sm"
                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                            >
                                You've seen all reviews for this book
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BookReviewsTab;