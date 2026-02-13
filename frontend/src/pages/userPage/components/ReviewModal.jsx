import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastSystem';

const ReviewModal = ({ isOpen, onClose, bookId, bookTitle, authorName }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const { authToken } = useAuth();
    const { success, error: showError } = useToast();

    const resetForm = () => {
        setRating(0);
        setHoverRating(0);
        setComment('');
        setErrors({});
    };

    const validateForm = () => {
        const newErrors = {};

        if (!rating || rating < 1 || rating > 5) {
            newErrors.rating = 'Please select a rating between 1 and 5 stars';
        }

        if (comment && comment.trim().length > 1000) {
            newErrors.comment = 'Comment cannot exceed 1000 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSubmitting(true);

        try {
            const response = await fetch('/api/user/reviews/add', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bookId: bookId,
                    rating: rating,
                    comment: comment.trim() || null
                })
            });

            if (response.ok) {
                success('Review added successfully! You can view it in the Reviews tab.');
                resetForm();
                onClose();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add review');
            }
        } catch (err) {
            console.error('Error adding review:', err);
            showError(err.message || 'Failed to add review');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            resetForm();
            onClose();
        }
    };

    const StarRating = () => {
        return (
            <div className="flex items-center gap-1 mb-4">
                <span
                    className="text-sm font-medium text-gray-700 mr-2"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                    Rating:
                </span>
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className={`text-2xl transition-colors duration-200 ${
                            star <= (hoverRating || rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                        } hover:text-yellow-400 focus:outline-none`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        disabled={submitting}
                    >
                        ⭐
                    </button>
                ))}
                <span
                    className="ml-2 text-sm text-gray-600"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                    {rating ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Select rating'}
                </span>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-screen overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2
                                className="text-xl font-bold text-[#321d4f]"
                                style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                                Add Review
                            </h2>
                            <div className="mt-2">
                                <p
                                    className="text-sm text-gray-800 font-medium"
                                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                                >
                                    {bookTitle}
                                </p>
                                <p
                                    className="text-xs text-gray-600"
                                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                                >
                                    by {authorName}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={submitting}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Star Rating */}
                        <div className="mb-4">
                            <StarRating />
                            {errors.rating && (
                                <p
                                    className="text-red-500 text-xs mt-1"
                                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                                >
                                    {errors.rating}
                                </p>
                            )}
                        </div>

                        {/* Comment */}
                        <div className="mb-6">
                            <label
                                htmlFor="comment"
                                className="block text-sm font-medium text-gray-700 mb-2"
                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                            >
                                Comment (Optional)
                            </label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your thoughts about this book..."
                                disabled={submitting}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#321d4f] focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                                rows={4}
                                maxLength={1000}
                            />
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-gray-500">
                                    {comment.length}/1000 characters
                                </span>
                                {errors.comment && (
                                    <p
                                        className="text-red-500 text-xs"
                                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                                    >
                                        {errors.comment}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={submitting}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || !rating}
                                className="flex-1 px-4 py-2 bg-[#321d4f] text-white rounded-lg hover:bg-[#4a2870] focus:outline-none focus:ring-2 focus:ring-[#321d4f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                            >
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Adding...
                                    </>
                                ) : (
                                    'Add Review'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;