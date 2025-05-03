import React from 'react';
import genreEmojis from '../utils/genreEmojis';

const BookCard = ({ book }) => {
    const coverImage = book.imageUrls && book.imageUrls.length > 0
        ? book.imageUrls[0]
        : "https://via.placeholder.com/300x450?text=No+Image";

    return (
        <div
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full max-w-md mx-auto"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
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

                <div className="mb-4">
                    <p className="text-xs font-bold text-gray-500 mb-1">Categories:</p>
                    <div className="flex flex-wrap gap-1 min-h-8">
                        {book.categories && book.categories.length > 0 ? (
                            book.categories.map((cat, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-1 bg-[#fff4f1] text-[#ff6b4a] text-xs font-semibold rounded-full border border-[#ffd4c8]"
                                >
                                    {cat}
                                </span>
                            ))
                        ) : (
                            <span className="text-gray-400 text-xs">No categories specified</span>
                        )}
                    </div>
                </div>

                <div className="mt-auto flex space-x-2">
                    <button
                        className="flex-1 py-2 rounded-full bg-[#321d4f] text-white font-medium hover:bg-[#241736] transition-colors duration-200 shadow"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        Buy ({book.purchasePrice} zł)
                    </button>
                    <button
                        className="flex-1 py-2 rounded-full bg-[#ffbdb1] text-gray-800 font-medium hover:bg-[#ff9c8b] transition-colors duration-200 shadow"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        Rent (from {(book.rentalPrice * 7).toFixed(2)} zł)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookCard;