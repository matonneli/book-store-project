import React, { useState } from 'react';
import genreEmojis from '../utils/genreEmojis';
import PurchaseModal from './PurchaseModal';
import RentalModal from './RentalModal';

const BookCard = ({ book, onBookClick }) => {
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [showRentalModal, setShowRentalModal] = useState(false);

    const isUnavailable = book.status === 'NOT_AVAILABLE' || book.stockQuantity === 0;

    const coverImage = book.imageUrls && book.imageUrls.length > 0
        ? book.imageUrls[0]
        : "https://via.placeholder.com/300x450?text=No+Image";

    const handleCardClick = (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            return;
        }
        if (onBookClick) {
            onBookClick(book.bookId);
        }
    };

    const handlePurchaseClick = (e) => {
        e.stopPropagation();
        if (!isUnavailable) setShowPurchaseModal(true);
    };

    const handleRentalClick = (e) => {
        e.stopPropagation();
        if (!isUnavailable) setShowRentalModal(true);
    };

    const hasDiscount = book.discountPercent != null && Number(book.discountPercent) > 0;

    return (
        <>
            <div
                className={`bg-white rounded-2xl shadow-md overflow-hidden flex flex-col h-full max-w-md mx-auto cursor-pointer transition-shadow duration-300 ${
                    isUnavailable
                        ? 'opacity-60 grayscale'
                        : 'hover:shadow-xl'
                }`}
                style={{ fontFamily: "'Montserrat', sans-serif" }}
                onClick={handleCardClick}
            >
                <div className="relative h-72 bg-gray-100 flex items-center justify-center px-4 py-4 group shadow-md rounded-t-2xl">
                    <img
                        src={coverImage}
                        alt={book.title}
                        className={`max-h-full max-w-full object-contain rounded-md shadow transition-transform duration-300 ease-in-out ${
                            !isUnavailable ? 'group-hover:scale-105' : ''
                        }`}
                    />
                    {isUnavailable && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-t-2xl">
                            <span className="bg-gray-800 bg-opacity-70 text-white text-sm font-semibold px-4 py-1.5 rounded-full tracking-wide">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                    <h3
                        className="text-xl font-bold mb-1 text-center"
                        style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 300 }}
                    >
                        {book.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-3 text-center">By {book.authorName}</p>

                    <div className="h-20 mb-4 overflow-hidden">
                        <p className="text-gray-600 text-sm text-justify leading-relaxed line-clamp-3">
                            {book.description || "No description available."}
                        </p>
                    </div>

                    <div className="mb-3">
                        <p className="text-xs font-bold text-gray-500 mb-1">Genres:</p>
                        <div className="flex flex-wrap gap-1 min-h-8 max-h-16 overflow-hidden">
                            {book.genres && book.genres.length > 0 ? (
                                book.genres.map((genre, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-1 bg-[#f5f3ff] text-[#4c1d95] text-xs font-semibold rounded-full flex items-center gap-1 border border-[#ddd6fe]"
                                    >
                                        {genreEmojis[genre] && <span>{genreEmojis[genre]}</span>}
                                        <span>{genre}</span>
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400 text-xs">No genres specified</span>
                            )}
                        </div>
                    </div>

                    <div className="mb-3">
                        <p className="text-xs font-bold text-gray-500 mb-1">Categories:</p>
                        <div className="flex flex-wrap gap-1 min-h-8 max-h-16 overflow-hidden">
                            {book.categories && book.categories.length > 0 ? (
                                book.categories.map((cat, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-1 bg-[#fff4f1] text-[#ff6b4a] text-xs font-semibold rounded-full border border-[#ffd4c8] flex items-center justify-center"
                                    >
                                        {cat}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400 text-xs">No categories specified</span>
                            )}
                        </div>
                    </div>

                    <div className="mt-auto">
                        <div className="flex space-x-2">
                            {(() => {
                                const originalPrice = book.purchasePrice;
                                const discountedPrice = hasDiscount
                                    ? originalPrice * (1 - Number(book.discountPercent) / 100)
                                    : originalPrice;

                                return (
                                    <button
                                        className={`flex-1 py-2 rounded-full font-medium shadow text-xs transition-colors duration-200 ${
                                            isUnavailable
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-[#321d4f] text-white hover:bg-[#241736]'
                                        }`}
                                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                                        onClick={handlePurchaseClick}
                                        disabled={isUnavailable}
                                    >
                                        {isUnavailable ? 'Unavailable' : hasDiscount ? (
                                            <div className="flex flex-col">
                                                <span>Buy {discountedPrice.toFixed(2)} zł</span>
                                                <span className="line-through text-gray-300 text-xs">
                                                    {originalPrice} zł
                                                </span>
                                            </div>
                                        ) : (
                                            `Buy (${originalPrice} zł)`
                                        )}
                                    </button>
                                );
                            })()}
                            <button
                                className={`flex-1 py-2 rounded-full font-medium shadow text-xs transition-colors duration-200 ${
                                    isUnavailable
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-[#ffbdb1] text-gray-800 hover:bg-[#ff9c8b]'
                                }`}
                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                                onClick={handleRentalClick}
                                disabled={isUnavailable}
                            >
                                {isUnavailable ? 'Unavailable' : `Rent (from ${(book.rentalPrice * 7).toFixed(2)} zł)`}
                            </button>
                        </div>

                        {hasDiscount && !isUnavailable && (
                            <div className="mt-2 text-center">
                                <div className="inline-flex items-center bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md transform -rotate-1">
                                    <span className="text-sm mr-1">🔥</span>
                                    <span className="uppercase tracking-wide">
                                        {book.discountPercent}% OFF
                                    </span>
                                    <span className="text-sm ml-1">🔥</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {!isUnavailable && (
                <>
                    <PurchaseModal
                        book={book}
                        isOpen={showPurchaseModal}
                        onClose={() => setShowPurchaseModal(false)}
                    />
                    <RentalModal
                        book={book}
                        isOpen={showRentalModal}
                        onClose={() => setShowRentalModal(false)}
                    />
                </>
            )}
        </>
    );
};

export default BookCard;