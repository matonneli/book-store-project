// pages/BookCatalogPage.jsx
import React, { useState, useEffect } from 'react';

// Reusable BookCard component
const BookCard = ({ book }) => {
    const coverImage = book.imageUrls && book.imageUrls.length > 0
        ? book.imageUrls[0]
        : "https://via.placeholder.com/300x450?text=No+Image";

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <div className="h-72 bg-gray-100 flex items-center justify-center px-4 py-4 group shadow-md group-hover:shadow-xl transition-shadow duration-300 ease-in-out rounded-t-2xl">
                <img
                    src={coverImage}
                    alt={book.title}
                    className="max-h-full max-w-full object-contain rounded-md shadow transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
            </div>

            <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-xl font-semibold mb-1">{book.title}</h3>
                <p className="text-gray-500 text-sm mb-2">By {book.authorName}</p>
                <p className="text-gray-600 text-sm flex-1 mb-4">
                    {book.description && book.description.length > 100
                        ? `${book.description.substring(0, 100)}...`
                        : book.description}
                </p>
                <div className="mt-auto flex space-x-2">
                    <button
                        className="flex-1 py-2 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors duration-200 shadow"
                    >
                        Buy (from {book.purchasePrice} zł)
                    </button>
                    <button
                        className="flex-1 py-2 rounded-full bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors duration-200 shadow"
                    >
                        Rent (from {(book.rentalPrice*7).toFixed(2)} zł)
                    </button>
                </div>
            </div>
        </div>
    );
};


// Main catalog page
const BookCatalogPage = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/catalog/books');
                if (!response.ok) throw new Error('Failed to fetch books');
                const data = await response.json();
                setBooks(data);
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching books:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold mb-6">Book Catalog</h1>

            {loading && (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            {!loading && !error && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {books && books.length > 0 ? (
                        books.map(book => <BookCard key={book.bookId} book={book} />)
                    ) : (
                        <p className="text-gray-500">No books available.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BookCatalogPage;
