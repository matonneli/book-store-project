import React, { useEffect, useState } from 'react';

const BookList = () => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8081/api/books', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log(data);
                setBooks(data);
            })
            .catch((error) => console.error('Error while downloading the books:', error));
    }, []);


    return (
        <div>
            <h1>Books</h1>
            <ul>
                {books.map((book) => (
                    <li key={book.bookId}>
                        <h2>{book.title}</h2>
                        <p><strong>Author:</strong> {book.authorId}</p>
                        <p><strong>description</strong> {book.description}</p>
                        <p><strong>publicationDate</strong> {new Date(book.publicationDate).toLocaleDateString()}</p>
                        <p><strong>purchasePrice</strong> {book.purchasePrice} </p>
                        <p><strong>rentalPrice</strong> {book.rentalPrice} </p>
                        <p><strong>stockQuantity</strong> {book.stockQuantity}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BookList;