import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastSystem';
import { FaTrash, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import bookabeLogo from '../assets/images/bookabe-logo.jpg';

const CartItemCard = ({ item, onRemove, onBookClick }) => {
    const [removing, setRemoving] = useState(false);

    const coverImage = item.imageUrls && item.imageUrls.length > 0
        ? item.imageUrls[0]
        : "https://via.placeholder.com/120x180?text=No+Image";

    const handleRemove = async () => {
        setRemoving(true);
        try {
            await onRemove(item.cartItemId);
        } finally {
            setRemoving(false);
        }
    };

    const handleBookClick = () => {
        onBookClick(item.bookId);
    };

    const hasDiscount = item.discountPercent && Number(item.discountPercent) > 0;

    return (
        <div className={`bg-white rounded-xl shadow-md p-6 flex gap-4 hover:shadow-lg transition-shadow ${!item.available ? 'opacity-60 filter grayscale' : ''}`}>
            <div
                className="w-24 h-36 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleBookClick}
            >
                <img
                    src={coverImage}
                    alt={item.title}
                    className="max-h-full max-w-full object-contain rounded-md"
                />
            </div>
            <div className="flex-1 relative">
                {!item.available && (
                    <div className="absolute top-0 left-0 w-full bg-red-100 text-red-600 text-center py-2 rounded-t-lg">
                        <span className="text-lg font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            Currently Unavailable
                        </span>
                    </div>
                )}
                <h3
                    className="text-lg font-semibold text-[#321d4f] mb-1 cursor-pointer hover:underline mt-8"
                    onClick={handleBookClick}
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                    {item.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2">by {item.authorName}</p>
                <div className="mb-3">
                    {item.type === 'BUY' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Purchase
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Rent for {item.rentalDays} days
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div>
                        {hasDiscount ? (
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-[#321d4f]">
                                    {item.price?.toFixed(2)} zł
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                    {item.originalPrice?.toFixed(2)} zł
                                </span>
                                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                                    -{item.discountPercent}%
                                </span>
                            </div>
                        ) : (
                            <span className="text-lg font-bold text-[#321d4f]">
                                {item.price?.toFixed(2)} zł
                            </span>
                        )}
                    </div>
                </div>
                {item.stockQuantity && (
                    <p className="text-xs text-gray-500 mt-1">
                        {item.stockQuantity} in stock
                    </p>
                )}
            </div>
            <div className="flex flex-col justify-between items-end">
                <button
                    onClick={handleRemove}
                    disabled={removing}
                    className={`p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors ${removing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Remove from cart"
                >
                    <FaTrash size={16} />
                </button>
                {item.addedAt && (
                    <p className="text-xs text-gray-400 mt-2">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                )}
            </div>
        </div>
    );
};

const CartSummary = ({ cartData }) => {
    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-[#321d4f]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Order Summary
            </h3>
            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items in cart:</span>
                    <span className="font-medium">{cartData.itemsCount || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available slots:</span>
                    <span className="font-medium">{cartData.remainingSlots || 0}</span>
                </div>
                {Number(cartData.totalDiscount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                        <span>Total discount:</span>
                        <span className="font-medium">-{cartData.totalDiscount.toFixed(2)} zł</span>
                    </div>
                )}
                <hr className="my-3" />
                <div className="flex justify-between text-lg font-bold text-[#321d4f]">
                    <span>Total amount:</span>
                    <span>{cartData.totalAmount?.toFixed(2) || '0.00'} zł</span>
                </div>
            </div>
        </div>
    );
};

const EmptyCart = ({ onContinueShopping }) => {
    return (
        <div className="text-center py-16">
            <div className="mb-6">
                <FaShoppingCart size={64} className="mx-auto text-gray-300" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-600 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8">
                Looks like you haven't added any books to your cart yet.
            </p>
            <button
                onClick={onContinueShopping}
                className="bg-[#321d4f] text-white px-6 py-3 rounded-full hover:bg-[#4a2870] transition-colors font-medium"
            >
                Start Shopping
            </button>
        </div>
    );
};

const CartPage = () => {
    const [cartData, setCartData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasShownWarning, setHasShownWarning] = useState(false);

    const navigate = useNavigate();
    const { authToken, logout } = useAuth();
    const { removeFromCart, fetchCartCount, clearCart, fetchCartItems } = useCart();
    const { success, error: showError, warning } = useToast();

    useEffect(() => {
        if (!authToken) {
            navigate('/login/user');
            return;
        }
        fetchCartContents();
    }, [authToken, navigate]);

    const fetchCartContents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/cart/contents', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCartData(data);
                if (!hasShownWarning) {
                    const unavailableItems = data.items?.filter(item => !item.available) || [];
                    if (unavailableItems.length > 0) {
                        warning(`${unavailableItems.length} item${unavailableItems.length > 1 ? 's' : ''} in your cart ${unavailableItems.length > 1 ? 'are' : 'is'} currently unavailable. Please remove them to proceed.`);
                        setHasShownWarning(true);
                    }
                }
            } else {
                throw new Error('Failed to fetch cart contents');
            }
        } catch (err) {
            console.error('Error fetching cart contents:', err);
            setError(err.message);
            showError('Failed to load cart contents');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveItem = async (cartItemId) => {
        try {
            await removeFromCart(cartItemId);
            await fetchCartContents();
            await fetchCartCount();
            success('Item removed from cart');
        } catch (err) {
            console.error('Error removing item:', err);
            showError(err.message || 'Failed to remove item');
        }
    };

    const handleRemoveAllUnavailable = async () => {
        try {
            const unavailableItems = cartData.items.filter(item => !item.available);
            for (const item of unavailableItems) {
                await removeFromCart(item.cartItemId);
            }
            await fetchCartContents();
            await fetchCartCount();
            success('All unavailable items removed from cart');
        } catch (err) {
            console.error('Error removing unavailable items:', err);
            showError(err.message || 'Failed to remove unavailable items');
        }
    };

    const handleClearCart = async () => {
        try {
            await clearCart();
            await fetchCartContents();
            await fetchCartCount();
            success('Cart cleared successfully');
        } catch (error) {
            showError(error.message || 'Failed to clear cart');
        }
    };

    const handleBookClick = (bookId) => {
        navigate(`/book/${bookId}`);
    };

    const handleContinueShopping = () => {
        navigate('/catalog');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="pt-8 px-12 flex justify-between items-center bg-white shadow-sm">
                    <div className="flex items-center gap-4 cursor-pointer">
                        <img src={bookabeLogo} alt="bookabe logo" className="w-20 h-20 rounded-full object-cover" />
                        <span className="text-[#321d4f] text-5xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            bookabe
                        </span>
                    </div>
                </header>
                <div className="container mx-auto px-6 py-16 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#321d4f]"></div>
                    <p className="mt-2 text-[#4a4a4a]">Loading your cart...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-6 py-16 text-center">
                    <div className="text-red-600 p-4">
                        Error: {error}
                        <button onClick={fetchCartContents} className="ml-4 text-blue-600 hover:underline">
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const hasItems = cartData?.items && cartData.items.length > 0;
    const hasUnavailableItems = cartData?.items?.some(item => !item.available);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="pt-8 px-12 flex justify-between items-center bg-white shadow-sm">
                <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => navigate('/')}
                >
                    <img src={bookabeLogo} alt="bookabe logo" className="w-20 h-20 rounded-full object-cover" />
                    <span className="text-[#321d4f] text-5xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        bookabe
                    </span>
                </div>
                <div className="flex items-center gap-6 text-[#321d4f] text-lg font-medium">
                    <button onClick={() => navigate('/user')} className="hover:underline text-[#321d4f]">
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
                </div>
            </header>
            <div className="container mx-auto px-6 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={handleContinueShopping}
                        className="flex items-center gap-2 text-[#321d4f] hover:text-[#4a2870] transition-colors"
                    >
                        <FaArrowLeft size={16} />
                        <span>Back to Catalog</span>
                    </button>
                    <h1 className="text-4xl font-semibold text-[#321d4f]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Shopping Cart
                    </h1>
                </div>
                {!hasItems ? (
                    <EmptyCart onContinueShopping={handleContinueShopping} />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="space-y-4">
                                {cartData.items.map((item) => (
                                    <CartItemCard
                                        key={item.cartItemId}
                                        item={item}
                                        onRemove={handleRemoveItem}
                                        onBookClick={handleBookClick}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <CartSummary cartData={cartData} />
                        </div>
                    </div>
                )}
                {hasItems && (
                    <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={handleContinueShopping}
                            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-200 transition-colors font-medium"
                        >
                            <FaArrowLeft size={16} />
                            Continue Shopping
                        </button>
                        <button
                            onClick={handleClearCart}
                            className="bg-[#321d4f] text-white px-6 py-3 rounded-full hover:bg-[#4a2870] transition-colors font-medium"
                        >
                            Clear Cart
                        </button>
                        {hasUnavailableItems && (
                            <button
                                onClick={handleRemoveAllUnavailable}
                                className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition-colors font-medium"
                            >
                                Remove All Unavailable Items
                            </button>
                        )}
                        <button
                            disabled={hasUnavailableItems}
                            onClick={() => navigate('/checkout')}
                            className={`px-6 py-3 rounded-full font-medium ${
                                hasUnavailableItems
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-[#321d4f] text-white hover:bg-[#4a2870] transition-colors'
                            }`}
                            title={hasUnavailableItems ? 'Remove unavailable items to proceed to checkout' : 'Proceed to Checkout'}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;