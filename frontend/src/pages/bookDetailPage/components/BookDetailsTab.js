import React from 'react';
import genreEmojis from '../../../utils/genreEmojis';

const BookDetailsTab = ({ book }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow">
            <h2
                className="text-3xl font-semibold text-[#321d4f] mb-4"
                style={{ fontFamily: "'Poppins', sans-serif" }}
            >
                {book.title}
            </h2>
            <p
                className="text-lg text-gray-600 mb-6"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
                by {book.authorName}
            </p>

            <div className="mb-6">
                <h3
                    className="text-xl font-semibold text-[#321d4f] mb-3"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                    Description
                </h3>
                <p
                    className="text-gray-700 leading-relaxed text-justify"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                    {book.description || "No description available."}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <h4
                        className="text-lg font-semibold text-[#321d4f] mb-2"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                        Publication Date
                    </h4>
                    <p
                        className="text-gray-700"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        {formatDate(book.publicationDate)}
                    </p>
                </div>

                <div>
                    <h4
                        className="text-lg font-semibold text-[#321d4f] mb-2"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                        Stock
                    </h4>
                    <p
                        className="text-gray-700"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        {book.stockQuantity} copies available
                    </p>
                </div>
            </div>

            <div className="mb-6">
                <h4
                    className="text-lg font-semibold text-[#321d4f] mb-2"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                    Genres
                </h4>
                <div className="flex flex-wrap gap-2">
                    {book.genres && book.genres.length > 0 ? (
                        book.genres.map((genre, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 bg-[#f5f3ff] text-[#4c1d95] text-sm font-semibold rounded-full border border-[#ddd6fe] flex items-center gap-1"
                            >
                                {genreEmojis[genre] && <span>{genreEmojis[genre]}</span>}
                                <span>{genre}</span>
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-400">No genres specified</span>
                    )}
                </div>
            </div>

            <div>
                <h4
                    className="text-lg font-semibold text-[#321d4f] mb-2"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                    Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                    {book.categories && book.categories.length > 0 ? (
                        book.categories.map((cat, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 bg-[#fff4f1] text-[#ff6b4a] text-sm font-semibold rounded-full border border-[#ffd4c8]"
                            >
                                {cat}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-400">No categories specified</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookDetailsTab;