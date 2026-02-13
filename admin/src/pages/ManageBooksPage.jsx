import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBookAdmin } from '../contexts/BookAdminContext';
import { useReferences } from '../contexts/AdminReferenceContext';
import AddBookModal from "../components/AddBookModal";
import EditBookModal from '../components/EditBookModal';
import AddAuthorModal from '../components/AddAuthorModal';
import EditAuthorModal from '../components/EditAuthorModal';
import { ToastProvider, useToast } from '../components/ToastSystem';

const BookRow = React.memo(({ book, onEdit }) => {
    const { getAuthorName, getCategoryNames, getGenreNames } = useReferences();

    const formatDateSimple = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') return 'N/A';
        if (dateStr.includes('T')) {
            const [date, time] = dateStr.split('T');
            return `${date} ${time.substring(0, 5)}`;
        }
        return dateStr;
    };

    const pubDate = formatDateSimple(book.publicationDate);
    const createdDate = formatDateSimple(book.createdAt);
    const updatedDate = formatDateSimple(book.updatedAt);
    const purchasePrice = book.purchasePrice ? `${book.purchasePrice.toFixed(2)} zł` : 'N/A';
    const rentalPrice = book.rentalPrice ? `${book.rentalPrice.toFixed(2)} zł` : 'N/A';
    const discount = book.discountPercent && book.discountPercent > 0 ? `${book.discountPercent}%` : 'N/A';

    return (
        <tr>
            <td><strong>#{book.bookId}</strong></td>
            <td><strong>{book.title}</strong></td>
            <td>{getAuthorName(book.authorId)}</td>
            <td><small>{pubDate}</small></td>
            <td>{purchasePrice}</td>
            <td>{rentalPrice}</td>
            <td>{discount}</td>
            <td>{book.stockQuantity || 0}</td>
            <td><small>{getGenreNames(book.genreIds)}</small></td>
            <td><small>{getCategoryNames(book.categoryIds)}</small></td>
            <td><small>{createdDate}</small></td>
            <td><small>{updatedDate}</small></td>
            <td>
                <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => onEdit(book.bookId)}
                    title="Edit Book"
                >
                    Edit
                </button>
            </td>
        </tr>
    );
});

BookRow.displayName = 'BookRow';

const ManageBooksPageContent = () => {
    const {
        books,
        loading,
        error,
        currentPage,
        totalPages,
        totalElements,
        searchQuery,
        sortBy,
        sortOrder,
        handleSearchChange,
        handleSortByChange,
        handleSortOrderChange,
        handlePageChange,
    } = useBookAdmin();

    const { isReady: refsReady } = useReferences();

    const navigate = useNavigate();
    const { updateLastActivity, logout, getRemainingTime } = useAuth();
    const toast = useToast();

    const [showAddBookModal, setShowAddBookModal] = useState(false);
    const [showEditBookModal, setShowEditBookModal] = useState(false);
    const [selectedBookId, setSelectedBookId] = useState(null);
    const [showAddAuthorModal, setShowAddAuthorModal] = useState(false);
    const [showEditAuthorModal, setShowEditAuthorModal] = useState(false);

    const thirtyMinWarningShown = useRef(false);
    const fiveMinWarningShown = useRef(false);

    useEffect(() => {
        const checkSessionTime = setInterval(() => {
            const timeLeft = getRemainingTime();
            const minutesLeft = Math.floor(timeLeft / 1000 / 60);

            if (minutesLeft <= 30 && minutesLeft > 5 && !thirtyMinWarningShown.current) {
                toast.warning('Your session will expire in 30 minutes. Continue working to automatically extend it.', 8000);
                thirtyMinWarningShown.current = true;
            }

            if (minutesLeft <= 5 && minutesLeft > 0 && !fiveMinWarningShown.current) {
                toast.error('⚠️ Warning! Your session will expire in 5 minutes. Perform any action to extend the session or log in again.', 10000);
                fiveMinWarningShown.current = true;
            }

            if (minutesLeft > 30) {
                thirtyMinWarningShown.current = false;
                fiveMinWarningShown.current = false;
            } else if (minutesLeft > 5) {
                fiveMinWarningShown.current = false;
            }

            if (timeLeft <= 0) {
                clearInterval(checkSessionTime);
                toast.error('Your session has expired. Please log in again.', 5000);
                setTimeout(() => {
                    logout();
                    navigate('/login');
                }, 2000);
            }
        }, 10000); // Проверка каждые 10 секунд

        return () => clearInterval(checkSessionTime);
    }, [getRemainingTime, logout, navigate, toast]);

    const handleAddBook = () => {
        setShowAddBookModal(true);
        updateLastActivity('addBookAdmin');
    };

    const handleBookAdded = () => {
        toast.success(`New book created successfully!`);
    };

    const handleAddAuthor = () => {
        setShowAddAuthorModal(true);
        updateLastActivity('addAuthorAdmin');
    };

    const handleEditAuthor = () => {
        setShowEditAuthorModal(true);
        updateLastActivity('editAuthorAdmin');
    };

    const handleAuthorAdded = (newAuthor) => {
        toast.success(`Author "${newAuthor.fullName}" created successfully!`);
    };

    const handleEditBook = (bookId) => {
        setSelectedBookId(bookId);
        setShowEditBookModal(true);
        updateLastActivity('editBookAdmin');
    };

    const handleBookUpdated = (updatedBook) => {
        toast.success(`Book "${updatedBook.title}" updated successfully!`);
    };

    const handleBackToDashboard = () => {
        console.log('Navigating to dashboard...');
        updateLastActivity('navigateToDashboard');
        // Принудительная перезагрузка страницы
        window.location.href = '/dashboard';
    };

    const handleEditBookMemo = useMemo(() => handleEditBook, []);

    if (!refsReady || (loading && books.length === 0)) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading system references and books...</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>Manage Books</h2>
                    <p className="text-muted mb-0">Manage your bookstore inventory</p>
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={handleBackToDashboard}
                >
                    ← Back to Dashboard
                </button>
            </div>

            <div className="card mb-4">
                <div className="card-body">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="fas fa-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by title or author..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={sortBy}
                                onChange={(e) => handleSortByChange(e.target.value)}
                            >
                                <option value="created_at">Created At</option>
                                <option value="updated_at">Updated At</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={sortOrder}
                                onChange={(e) => handleSortOrderChange(e.target.value)}
                            >
                                <option value="desc">Descending</option>
                                <option value="asc">Ascending</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            {loading && <span className="spinner-border spinner-border-sm text-primary"></span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-12">
                            <button
                                className="btn btn-primary me-3"
                                onClick={handleAddBook}
                            >
                                Add New Book
                            </button>
                            <button
                                className="btn btn-info me-3"
                                onClick={handleAddAuthor}
                            >
                                Add New Author
                            </button>
                            <button
                                className="btn btn-warning"
                                onClick={handleEditAuthor}
                            >
                                Edit Author
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="alert alert-danger mb-4">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Table */}
            {!error && (
                <div className="card shadow-sm">
                    <div className="card-header bg-white">
                        <h5 className="mb-0">Books List</h5>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Author</th>
                                    <th>Publication Date</th>
                                    <th>Purchase Price</th>
                                    <th>Rental Price</th>
                                    <th>Discount</th>
                                    <th>Stock</th>
                                    <th>Genres</th>
                                    <th>Categories</th>
                                    <th>Created At</th>
                                    <th>Updated At</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {books.length === 0 ? (
                                    <tr>
                                        <td colSpan="13" className="text-center py-4">
                                            <div className="text-muted">
                                                <i className="fas fa-book-open fa-2x mb-2"></i>
                                                <p>No books found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    books.map((book) => (
                                        <BookRow
                                            key={book.bookId}
                                            book={book}
                                            onEdit={handleEditBookMemo}
                                        />
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <div className="card-footer bg-white">
                            <nav>
                                <ul className="pagination pagination-sm justify-content-center mb-2">
                                    <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 0}
                                        >
                                            Previous
                                        </button>
                                    </li>

                                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = index;
                                        } else if (currentPage < 3) {
                                            pageNum = index;
                                        } else if (currentPage >= totalPages - 3) {
                                            pageNum = totalPages - 5 + index;
                                        } else {
                                            pageNum = currentPage - 2 + index;
                                        }

                                        return (
                                            <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(pageNum)}
                                                >
                                                    {pageNum + 1}
                                                </button>
                                            </li>
                                        );
                                    })}

                                    <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages - 1}
                                        >
                                            Next
                                        </button>
                                    </li>
                                </ul>
                                <small className="text-muted d-block text-center">
                                    Page {currentPage + 1} of {totalPages} (Showing {books.length} of {totalElements} books)
                                </small>
                            </nav>
                        </div>
                    )}
                </div>
            )}

            <AddBookModal
                show={showAddBookModal}
                onClose={() => setShowAddBookModal(false)}
                onBookAdded={() => {
                    handleBookAdded();
                    setShowAddBookModal(false);
                }}
            />

            <EditBookModal
                bookId={selectedBookId}
                show={showEditBookModal}
                onClose={() => setShowEditBookModal(false)}
                onBookUpdated={handleBookUpdated}
            />

            <AddAuthorModal
                show={showAddAuthorModal}
                onClose={() => setShowAddAuthorModal(false)}
                onAuthorAdded={handleAuthorAdded}
            />

            <EditAuthorModal
                show={showEditAuthorModal}
                onClose={() => setShowEditAuthorModal(false)}
            />
        </div>
    );
};

const ManageBooksPage = () => {
    return (
        <ToastProvider>
            <ManageBooksPageContent />
        </ToastProvider>
    );
};

export default ManageBooksPage;