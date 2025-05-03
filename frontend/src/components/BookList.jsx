import React from 'react';
import BookCard from './BookCard';

const BookList = ({ books }) => {
    if (!books || books.length === 0) {
        return <div className="text-center text-gray-500 text-lg">No books found.</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6">
            {books.map(book => (
                <BookCard key={book.bookId} book={book} />
            ))}
        </div>
    );
};

export default BookList;
