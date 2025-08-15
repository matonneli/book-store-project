import React, { useState } from 'react';
import genreEmojis from '../utils/genreEmojis';
import PurchaseModal from './PurchaseModal';
import RentalModal from './RentalModal';

const BookCard = ({ book, onBookClick }) => {
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [showRentalModal, setShowRentalModal] = useState(false);

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
        setShowPurchaseModal(true);
    };

    const handleRentalClick = (e) => {
        e.stopPropagation();
        setShowRentalModal(true);
    };

    const hasDiscount = book.discountPercent != null && Number(book.discountPercent) > 0;

    return (
        <>
            <div
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full max-w-md mx-auto cursor-pointer"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
                onClick={handleCardClick}
            >
                <div className="h-72 bg-gray-100 flex items-center justify-center px-4 py-4 group shadow-md group-hover:shadow-xl transition-shadow duration-300 ease-in-out rounded-t-2xl">
                    <img
                        src={coverImage}
                        alt={book.title}
                        className="max-h-full max-w-full object-contain rounded-md shadow transition-transform duration-300 ease-in-out group-hover:scale-105"
                    />
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
                                        className="flex-1 py-2 rounded-full bg-[#321d4f] text-white font-medium hover:bg-[#241736] transition-colors duration-200 shadow text-xs"
                                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                                        onClick={handlePurchaseClick}
                                    >
                                        {hasDiscount ? (
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
                                className="flex-1 py-2 rounded-full bg-[#ffbdb1] text-gray-800 font-medium hover:bg-[#ff9c8b] transition-colors duration-200 shadow text-xs"
                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                                onClick={handleRentalClick}
                            >
                                Rent (from {(book.rentalPrice * 7).toFixed(2)} zł)
                            </button>
                        </div>

                        {hasDiscount && (
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

            {/* Modals */}
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
    );
};

export default BookCard;