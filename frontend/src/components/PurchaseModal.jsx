import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastSystem';

const PurchaseModal = ({ book, isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [availability, setAvailability] = useState(null);
    const { addToCart, getBookCountInCart, isCartFull } = useCart();
    const { success, error } = useToast();

    useEffect(() => {
        if (isOpen && book) {
            checkAvailability();
        }
    }, [isOpen, book]);

    const checkAvailability = async () => {
        try {
            const authToken = localStorage.getItem('authToken');
            const result = await fetch(`/api/cart/check-availability?bookId=${book.bookId}&type=BUY`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (result.ok) {
                const data = await result.json();
                setAvailability(data);
            }
        } catch (err) {
            console.error('Error checking availability:', err);
        }
    };

    const handleAddToCart = async () => {
        if (loading) return;

        setLoading(true);
        try {
            await addToCart(book.bookId, 'BUY');
            success(`📚 "${book.title}" added to cart for purchase!`);
            onClose();
        } catch (err) {
            error(err.message || 'Error adding to cart');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !book) return null;

    const bookCountInCart = getBookCountInCart(book.bookId);
    const availableToAdd = book.stockQuantity - bookCountInCart;
    const hasDiscount = book.discountPercent != null && Number(book.discountPercent) > 0;
    const originalPrice = book.purchasePrice;
    const discountedPrice = hasDiscount
        ? originalPrice * (1 - Number(book.discountPercent) / 100)
        : originalPrice;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#321d4f] rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl">📚</span>
                    </div>
                    <h2
                        className="text-2xl font-bold text-[#321d4f] mb-2"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                        Add to Cart
                    </h2>
                    <p className="text-gray-600">for purchase</p>
                </div>

                <div className="mb-6">
                    <h3
                        className="font-semibold text-lg mb-2 text-center"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        {book.title}
                    </h3>
                    <p className="text-gray-500 text-sm text-center mb-4">
                        Author: {book.authorName}
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">In stock:</span>
                            <span className="font-semibold text-[#321d4f]">{book.stockQuantity} copies.</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">In cart:</span>
                            <span className="font-semibold text-orange-600">{bookCountInCart} copies.</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Can add:</span>
                            <span className="font-semibold text-green-600">{availableToAdd} copies.</span>
                        </div>
                    </div>

                    <div className="text-center mb-4">
                        {hasDiscount ? (
                            <div>
                                <div className="text-2xl font-bold text-[#321d4f] mb-1">
                                    {discountedPrice.toFixed(2)} zł
                                </div>
                                <div className="text-lg text-gray-500 line-through">
                                    {originalPrice} zł
                                </div>
                                <div className="inline-flex items-center bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full mt-2">
                                    <span className="text-sm mr-1">🔥</span>
                                    <span>{book.discountPercent}% DISCOUNT</span>
                                    <span className="text-sm ml-1">🔥</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-2xl font-bold text-[#321d4f]">
                                {originalPrice} zł
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors duration-200"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddToCart}
                        disabled={loading || availableToAdd <= 0 || isCartFull()}
                        className={`flex-1 py-3 px-4 font-medium rounded-full transition-colors duration-200 ${
                            loading || availableToAdd <= 0 || isCartFull()
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-[#321d4f] text-white hover:bg-[#241736]'
                        }`}
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                Adding...
                            </div>
                        ) : availableToAdd <= 0 ? (
                            'Out of Stock'
                        ) : isCartFull() ? (
                            'Cart Full'
                        ) : (
                            'Add to Cart'
                        )}
                    </button>
                </div>

                {isCartFull() && (
                    <p className="text-center text-sm text-red-600 mt-3">
                        Maximum 4 books in cart
                    </p>
                )}
            </div>
        </div>
    );
};

export default PurchaseModal;