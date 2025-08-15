import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ReviewsTab() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const [editingReview, setEditingReview] = useState(null);
    const [editForm, setEditForm] = useState({ rating: 5, comment: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Пагинация
    const [currentPage, setCurrentPage] = useState(0);
    const [hasNext, setHasNext] = useState(true);
    const [totalElements, setTotalElements] = useState(0);

    const { authToken } = useAuth();
    const observerRef = useRef(null);

    const fetchUserReviews = useCallback(async (page = 0, append = false) => {
        try {
            if (!append) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await fetch(`/api/user/reviews?page=${page}&size=10`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${authToken}` },
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
    }, [authToken]);

    // Функция для загрузки следующей страницы
    const loadMore = useCallback(() => {
        if (!loadingMore && hasNext) {
            fetchUserReviews(currentPage + 1, true);
        }
    }, [loadingMore, hasNext, currentPage, fetchUserReviews]);

    // Intersection Observer для бесконечного скролла
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
        if (authToken) {
            fetchUserReviews();
        }
    }, [authToken, fetchUserReviews]);

    const handleEditReview = (review) => {
        setEditingReview(review.reviewId);
        setEditForm({
            rating: review.rating,
            comment: review.comment || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingReview(null);
        setEditForm({ rating: 5, comment: '' });
    };

    const handleUpdateReview = async (reviewId) => {
        if (editForm.rating < 1 || editForm.rating > 5) {
            toast.error('Rating must be between 1 and 5');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/user/reviews/${reviewId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    rating: editForm.rating,
                    comment: editForm.comment.trim()
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update review');
            }

            toast.success('Review updated successfully!');
            setEditingReview(null);
            setEditForm({ rating: 5, comment: '' });

            // Обновляем отзыв в списке
            setReviews(prev => prev.map(review =>
                review.reviewId === reviewId
                    ? { ...review, rating: data.rating, comment: data.comment, createdAt: data.createdAt }
                    : review
            ));

        } catch (err) {
            toast.error(err.message || 'Failed to update review');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) {
            return;
        }

        try {
            const response = await fetch(`/api/user/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${authToken}` },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete review');
            }

            toast.success('Review deleted successfully!');

            // Удаляем отзыв из списка и обновляем счетчик
            setReviews(prev => prev.filter(review => review.reviewId !== reviewId));
            setTotalElements(prev => prev - 1);

        } catch (err) {
            toast.error(err.message || 'Failed to delete review');
            console.error(err);
        }
    };

    const renderStars = (rating, isEditable = false, onRatingChange = null) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={`${i <= rating ? 'text-yellow-500' : 'text-gray-300'} ${
                        isEditable ? 'cursor-pointer hover:text-yellow-400' : ''
                    }`}
                    onClick={isEditable ? () => onRatingChange(i) : undefined}
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
            <div className="bg-white p-8 rounded-lg shadow w-full max-w-4xl mx-auto">
                <p className="text-center text-lg">Loading your reviews...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-8 rounded-lg shadow w-full max-w-4xl mx-auto">
                <p className="text-center text-red-600 text-lg">{error}</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white p-8 rounded-lg shadow w-full max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h2
                        className="text-3xl font-semibold text-[#321d4f]"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                        Your Reviews
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

                {reviews.length === 0 ? (
                    <div className="text-center py-12">
                        <p
                            className="text-lg text-gray-600 mb-4"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                            You haven't written any reviews yet.
                        </p>
                        <p
                            className="text-sm text-gray-500"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                            Start reading and share your thoughts with other readers!
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
                                        <h3
                                            className="text-xl font-semibold text-[#321d4f] mb-1"
                                            style={{ fontFamily: "'Poppins', sans-serif" }}
                                        >
                                            {review.bookTitle}
                                        </h3>
                                        <p
                                            className="text-gray-600 mb-2"
                                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                                        >
                                            by {review.authorName}
                                        </p>

                                        {editingReview === review.reviewId ? (
                                            <div className="mb-3">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span
                                                        className="text-sm font-medium"
                                                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                                                    >
                                                        Rating:
                                                    </span>
                                                    <div className="flex text-lg">
                                                        {renderStars(editForm.rating, true, (rating) =>
                                                            setEditForm(prev => ({ ...prev, rating }))
                                                        )}
                                                    </div>
                                                    <span className="text-sm text-gray-500">
                                                        {editForm.rating}/5
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="flex text-lg">
                                                    {renderStars(review.rating)}
                                                </div>
                                                <span
                                                    className="text-sm text-gray-500"
                                                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                                                >
                                                    {review.rating}/5
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {editingReview === review.reviewId ? (
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleUpdateReview(review.reviewId)}
                                                disabled={isSubmitting}
                                                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition font-medium disabled:opacity-50"
                                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                                            >
                                                {isSubmitting ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                disabled={isSubmitting}
                                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition font-medium disabled:opacity-50"
                                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleEditReview(review)}
                                                className="px-3 py-1 text-sm bg-[#ffbdb1] text-gray-800 rounded-full hover:bg-[#ff9c8b] transition font-medium"
                                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteReview(review.reviewId)}
                                                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition font-medium"
                                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {editingReview === review.reviewId ? (
                                    <div className="mb-3">
                                        <label
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                                        >
                                            Comment:
                                        </label>
                                        <textarea
                                            value={editForm.comment}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, comment: e.target.value }))}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#321d4f] focus:border-transparent resize-none"
                                            rows="4"
                                            maxLength="1000"
                                            placeholder="Share your thoughts about this book..."
                                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                                        />
                                        <div className="text-xs text-gray-500 mt-1">
                                            {editForm.comment.length}/1000 characters
                                        </div>
                                    </div>
                                ) : (
                                    review.comment && (
                                        <div className="mb-3">
                                            <p
                                                className="text-gray-700 leading-relaxed"
                                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                                            >
                                                "{review.comment}"
                                            </p>
                                        </div>
                                    )
                                )}

                                <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-3">
                                    <span style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                        {formatDate(review.createdAt)}
                                    </span>
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
                                    You've seen all your reviews
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
        </>
    );
}

export default ReviewsTab;