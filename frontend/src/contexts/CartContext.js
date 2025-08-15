import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartCount, setCartCount] = useState(0);
    const [cartItems, setCartItems] = useState([]);
    const [cartData, setCartData] = useState(null);
    const [loading, setLoading] = useState(false);
    const { authToken } = useAuth();

    const MAX_CART_ITEMS = 4;

    useEffect(() => {
        if (authToken) {
            fetchCartCount();
            fetchCartItems();
        } else {
            setCartCount(0);
            setCartItems([]);
            setCartData(null);
        }
    }, [authToken]);

    const fetchCartCount = async () => {
        if (!authToken) return;

        try {
            const response = await fetch('/api/cart/count', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCartCount(data.count);
            } else {
                console.error('Failed to fetch cart count:', response.status);
            }
        } catch (error) {
            console.error('Error fetching cart count:', error);
        }
    };

    const fetchCartItems = async () => {
        if (!authToken) return;

        try {
            const response = await fetch('/api/cart/items', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const items = await response.json();
                setCartItems(items);
            } else {
                console.error('Failed to fetch cart items:', response.status);
            }
        } catch (error) {
            console.error('Error fetching cart items:', error);
        }
    };

    const fetchCartContents = async () => {
        if (!authToken) {
            setLoading(false);
            return null;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/cart/contents', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCartItems(data.items || []);
                setCartCount(data.itemsCount || 0);
                setCartData(data);
                return data;
            } else {
                throw new Error(`Failed to fetch cart contents: ${response.status}`);
            }
        } catch (error) {
            console.error('Error fetching cart contents:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const checkBookAvailability = async (bookId) => {
        if (!authToken) return { available: false, error: 'Not authenticated' };

        try {
            const response = await fetch(`/api/cart/check-availability?bookId=${bookId}&type=BUY`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                return await response.json();
            } else {
                return { available: false, error: 'Failed to check availability' };
            }
        } catch (error) {
            console.error('Error checking book availability:', error);
            return { available: false, error: error.message };
        }
    };

    const addToCart = async (bookId, type, rentalDays = null) => {
        if (!authToken) {
            throw new Error('Authentication required');
        }

        if (cartCount >= MAX_CART_ITEMS) {
            throw new Error(`Cart is full. Maximum ${MAX_CART_ITEMS} items allowed`);
        }

        setLoading(true);

        try {
            const requestBody = {
                bookId,
                type,
                ...(rentalDays && { rentalDays })
            };

            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const newItem = await response.json();
                setCartItems(prev => [...prev, newItem]);
                setCartCount(prev => prev + 1);
                return newItem;
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add item to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (cartItemId) => {
        if (!authToken) {
            throw new Error('Authentication required');
        }

        setLoading(true);

        try {
            const response = await fetch(`/api/cart/remove/${cartItemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
                setCartCount(prev => Math.max(0, prev - 1));
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to remove item from cart');
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        if (!authToken) throw new Error('Authentication required');
        setLoading(true);
        try {
            const response = await fetch('/api/cart/clear', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to clear cart');
            }
            setCartItems([]);
            setCartCount(0);
            setCartData(null);
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const getBookCountInCart = (bookId) => {
        return cartItems.filter(item => item.bookId === bookId).length;
    };

    const isCartFull = () => {
        return cartCount >= MAX_CART_ITEMS;
    };

    const getRemainingSlots = () => {
        return MAX_CART_ITEMS - cartCount;
    };

    const value = {
        cartCount,
        cartItems,
        cartData,
        loading,
        MAX_CART_ITEMS,
        addToCart,
        removeFromCart,
        clearCart,
        checkBookAvailability,
        getBookCountInCart,
        isCartFull,
        getRemainingSlots,
        fetchCartCount,
        fetchCartItems,
        fetchCartContents
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};