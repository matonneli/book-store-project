import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastSystem';

const RENTAL_OPTIONS = [
    {
        days: 7,
        title: 'Quick Reading',
        description: 'For light books and novels',
        icon: '🚀',
        popular: false
    },
    {
        days: 30,
        title: 'Standard',
        description: 'For most books',
        icon: '📖',
        popular: true
    },
    {
        days: 90,
        title: 'Deep Study',
        description: 'For textbooks and complex literature',
        icon: '🎓',
        popular: false
    }
];

const RentalModal = ({ book, isOpen, onClose }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [loading, setLoading] = useState(false);
    const [availability, setAvailability] = useState(null);
    const { addToCart, getBookCountInCart, isCartFull } = useCart();
    const { success, error } = useToast();

    useEffect(() => {
        if (isOpen && book) {
            checkAvailability();
            setSelectedOption(RENTAL_OPTIONS[1]); // Default to 30 days
        }
    }, [isOpen, book]);

    const checkAvailability = async () => {
        try {
            const authToken = localStorage.getItem('authToken');
            const result = await fetch(`/api/cart/check-availability?bookId=${book.bookId}&type=RENT`, {
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
        if (loading || !selectedOption) return;

        setLoading(true);
        try {
            await addToCart(book.bookId, 'RENT', selectedOption.days);
            success(`📚 "${book.title}" added to cart for ${selectedOption.days} days rental!`);
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
    const selectedPrice = selectedOption ? (book.rentalPrice * selectedOption.days) : 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#ffbdb1] rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-gray-800 text-2xl">📖</span>
                    </div>
                    <h2
                        className="text-2xl font-bold text-gray-800 mb-2"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                        Add to Cart
                    </h2>
                    <p className="text-gray-600">for rental</p>
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

                    <div className="bg-gray-50 rounded-lg p-3 mb-6 text-sm">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-600">In stock:</span>
                            <span className="font-semibold text-gray-800">{book.stockQuantity} copies.</span>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-600">In cart:</span>
                            <span className="font-semibold text-orange-600">{bookCountInCart} copies.</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Can add:</span>
                            <span className="font-semibold text-green-600">{availableToAdd} copies.</span>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                        Choose rental period
                    </h4>

                    <div className="space-y-3">
                        {RENTAL_OPTIONS.map((option) => {
                            const price = book.rentalPrice * option.days;
                            const isSelected = selectedOption?.days === option.days;

                            return (
                                <div
                                    key={option.days}
                                    onClick={() => setSelectedOption(option)}
                                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                        isSelected
                                            ? 'border-[#ffbdb1] bg-[#fff4f3] shadow-md'
                                            : 'border-gray-200 hover:border-[#ffbdb1] hover:bg-gray-50'
                                    }`}
                                >
                                    {option.popular && (
                                        <div className="absolute -top-2 left-4 bg-[#ffbdb1] text-gray-800 text-xs font-bold px-2 py-1 rounded-full">
                                            POPULAR
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">{option.icon}</span>
                                            <div>
                                                <div className="font-semibold text-gray-800">
                                                    {option.days} days - {option.title}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {option.description}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-lg text-gray-800">
                                                {price.toFixed(2)} zł
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {book.rentalPrice.toFixed(2)} zł/day
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`absolute right-3 top-3 w-5 h-5 rounded-full border-2 ${
                                        isSelected
                                            ? 'border-[#ffbdb1] bg-[#ffbdb1]'
                                            : 'border-gray-300'
                                    }`}>
                                        {isSelected && (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {selectedOption && (
                    <div className="bg-[#fff4f3] rounded-lg p-4 mb-6 text-center">
                        <p className="text-sm text-gray-600 mb-1">Total amount:</p>
                        <p className="text-2xl font-bold text-gray-800">
                            {selectedPrice.toFixed(2)} zł
                        </p>
                        <p className="text-xs text-gray-500">
                            for {selectedOption.days} days rental
                        </p>
                    </div>
                )}

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
                        disabled={loading || !selectedOption || availableToAdd <= 0 || isCartFull()}
                        className={`flex-1 py-3 px-4 font-medium rounded-full transition-colors duration-200 ${
                            loading || !selectedOption || availableToAdd <= 0 || isCartFull()
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-[#ffbdb1] text-gray-800 hover:bg-[#ff9c8b]'
                        }`}
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-800 mr-2"></div>
                                Adding...
                            </div>
                        ) : !selectedOption ? (
                            'Choose Period'
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

export default RentalModal;