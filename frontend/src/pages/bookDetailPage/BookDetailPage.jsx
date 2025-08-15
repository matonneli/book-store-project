import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CartProvider, useCart } from '../../contexts/CartContext';
import { ToastProvider } from '../../contexts/ToastSystem';
import bookabeLogo from '../../assets/images/bookabe-logo.jpg';
import BookDetailsTab from './components/BookDetailsTab';
import BookReviewsTab from './components/BookReviewsTab';
import PurchaseModal from '../../components/PurchaseModal';
import RentalModal from '../../components/RentalModal';
import { FaShoppingCart } from 'react-icons/fa';

const BookDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { authToken, logout } = useAuth();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [showRentalModal, setShowRentalModal] = useState(false);

    const TABS = [
        { id: 'details', label: 'Details' },
        { id: 'reviews', label: 'Reviews' }
    ];

    useEffect(() => {
        const fetchBook = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/catalog/books/${id}/details`);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setBook(data);
            } catch (err) {
                console.error('Error fetching book:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBook();
        }
    }, [id]);

    const CartIcon = () => {
        const { cartCount } = useCart();

        return (
            <div
                onClick={() => navigate('/cart')}
                className="relative group cursor-pointer text-[#321d4f]"
                title="Shopping Cart"
            >
                <FaShoppingCart size={22} className="group-hover:text-[#4a2870] transition" />
                {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-5">
                        {cartCount > 99 ? '99+' : cartCount}
                    </span>
                )}
            </div>
        );
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={`${i <= rating ? 'text-yellow-500' : 'text-gray-300'} text-2xl`}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    const renderTabContent = () => {
        if (!book) return null;

        switch (activeTab) {
            case 'details':
                return <BookDetailsTab book={book} />;
            case 'reviews':
                return <BookReviewsTab bookId={book.bookId} />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#321d4f]"></div>
                    <p className="mt-4 text-[#4a4a4a]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        Loading book details...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-lg mb-4">Error: {error}</p>
                    <button
                        onClick={() => navigate('/catalog')}
                        className="bg-[#321d4f] text-white px-6 py-2 rounded-full hover:bg-[#4a2870] transition"
                    >
                        Back to Catalog
                    </button>
                </div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 text-lg mb-4">Book not found</p>
                    <button
                        onClick={() => navigate('/catalog')}
                        className="bg-[#321d4f] text-white px-6 py-2 rounded-full hover:bg-[#4a2870] transition"
                    >
                        Back to Catalog
                    </button>
                </div>
            </div>
        );
    }

    const coverImage = book.imageUrls && book.imageUrls.length > 0
        ? book.imageUrls[0]
        : "https://via.placeholder.com/300x450?text=No+Image";

    const hasDiscount = book.discountPercent != null && Number(book.discountPercent) > 0;

    return (
        <CartProvider>
            <ToastProvider>
                <div className="min-h-screen bg-gray-50">
                    <header className="pt-8 px-12 flex justify-between items-center bg-white shadow">
                        <div
                            className="flex items-center gap-4 cursor-pointer"
                            onClick={() => navigate('/')}
                        >
                            <img
                                src={bookabeLogo}
                                alt="bookabe logo"
                                className="w-20 h-20 rounded-full object-cover"
                            />
                            <span
                                className="text-[#321d4f] text-5xl font-light tracking-wider"
                                style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                                bookabe
                            </span>
                        </div>

                        <div className="flex items-center gap-6 text-[#321d4f] text-lg font-medium">
                            {authToken && <CartIcon />}
                            <button
                                onClick={() => navigate('/catalog')}
                                className="hover:underline"
                                style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                                Back to Catalog
                            </button>
                            {authToken ? (
                                <>
                                    <button
                                        onClick={() => navigate('/user')}
                                        className="hover:underline"
                                    >
                                        My Account
                                    </button>
                                    <button
                                        onClick={() => {
                                            logout();
                                            navigate('/logout-success');
                                        }}
                                        className="bg-[#321d4f] text-white px-4 py-2 rounded-full hover:bg-[#4a2870] transition"
                                    >
                                        Log out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => navigate('/login/user')} className="hover:underline">
                                        Log in
                                    </button>
                                    <button onClick={() => navigate('/register/user')} className="hover:underline">
                                        Register
                                    </button>
                                </>
                            )}
                        </div>
                    </header>

                    <div className="container mx-auto px-6 py-8">
                        <div className="flex gap-8">
                            <div className="w-1/2">
                                <nav className="mb-6 border-b border-gray-300">
                                    <ul className="flex gap-6 text-lg font-medium text-[#321d4f]">
                                        {TABS.map((tab) => (
                                            <li key={tab.id}>
                                                <button
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`pb-2 border-b-4 ${
                                                        activeTab === tab.id
                                                            ? 'border-[#ff9c8b] text-[#ff9c8b]'
                                                            : 'border-transparent hover:text-[#ff9c8b]'
                                                    } transition-colors`}
                                                    style={{ fontFamily: "'Poppins', sans-serif" }}
                                                >
                                                    {tab.label}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>

                                {renderTabContent()}
                            </div>

                            <div className="w-1/2 flex flex-col items-center">
                                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                                    <div className="mb-4">
                                        <img
                                            src={coverImage}
                                            alt={book.title}
                                            className="w-full h-96 object-contain rounded-md shadow-md"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex justify-center mb-2">
                                            {renderStars(Math.round(book.averageRating || 0))}
                                        </div>
                                        <p
                                            className="text-center text-sm text-gray-600"
                                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                                        >
                                            {book.averageRating ? book.averageRating.toFixed(1) : '0.0'}/5.0
                                            ({book.totalReviews || 0} review{book.totalReviews !== 1 ? 's' : ''})
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {(() => {
                                            const originalPrice = book.purchasePrice;
                                            const discountedPrice = hasDiscount
                                                ? originalPrice * (1 - Number(book.discountPercent) / 100)
                                                : originalPrice;

                                            return (
                                                <button
                                                    onClick={() => setShowPurchaseModal(true)}
                                                    className="w-full py-3 rounded-full bg-[#321d4f] text-white font-medium hover:bg-[#241736] transition-colors duration-200 shadow"
                                                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                                                >
                                                    {hasDiscount ? (
                                                        <span>
                                                            Buy {discountedPrice.toFixed(2)} zł
                                                            <span className="line-through text-gray-300 ml-2 text-sm">
                                                                {originalPrice} zł
                                                            </span>
                                                        </span>
                                                    ) : (
                                                        `Buy (${originalPrice} zł)`
                                                    )}
                                                </button>
                                            );
                                        })()}
                                        <button
                                            onClick={() => setShowRentalModal(true)}
                                            className="w-full py-3 rounded-full bg-[#ffbdb1] text-gray-800 font-medium hover:bg-[#ff9c8b] transition-colors duration-200 shadow"
                                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                                        >
                                            Rent (from {(book.rentalPrice * 7).toFixed(2)} zł)
                                        </button>
                                    </div>

                                    {hasDiscount && (
                                        <div className="mt-4 text-center">
                                            <div className="inline-flex items-center bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg transform -rotate-2">
                                                <span className="text-lg mr-1">🔥</span>
                                                <span className="uppercase tracking-wider">
                                                    {book.discountPercent}% OFF
                                                </span>
                                                <span className="text-lg ml-1">🔥</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

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
                </div>
            </ToastProvider>
        </CartProvider>
    );
};

export default BookDetailPage;