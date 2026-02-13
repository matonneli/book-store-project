import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const BookAdminContext = createContext();
const API_BASE_URL = 'http://localhost:8081';

export const useBookAdmin = () => {
    const context = useContext(BookAdminContext);
    if (!context) {
        throw new Error('useBookAdmin should be used within BookAdminProvider');
    }
    return context;
};

export const BookAdminProvider = ({ children }) => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('updated_at');
    const [sortOrder, setSortOrder] = useState('desc');

    const { updateLastActivity, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isMountedRef = useRef(true);

    const fetchBooks = async (page = 0) => {
        if (location.pathname !== '/manage-books') {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                searchQuery: searchQuery || '',
                sortBy,
                sortOrder,
                page: page.toString(),
                size: pageSize.toString(),
            });

            const response = await fetch(`${API_BASE_URL}/api/admin/books?${params.toString()}`, {
                credentials: 'include',
            });

            if (response.status === 401) {
                await logout();
                navigate('/login');
                return;
            }

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error while getting books: ${response.status}, Response: ${text}`);
            }

            const data = await response.json();

            if (isMountedRef.current) {
                setBooks(data.books || []);
                setCurrentPage(data.currentPage || 0);
                setTotalPages(data.totalPages || 0);
                setTotalElements(data.totalElements || 0);
            }

            updateLastActivity('fetchBooksAdmin');
        } catch (err) {
            if (isMountedRef.current) {
                setError(err.message);
                console.error('Error while getting books:', err);
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (location.pathname === '/manage-books') {
            fetchBooks(currentPage);
        }
    }, [searchQuery, sortBy, sortOrder, currentPage, location.pathname]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
            updateLastActivity('pageChangeAdmin');
        }
    };

    const handleSearchChange = (query) => {
        setSearchQuery(query);
        setCurrentPage(0);
        updateLastActivity('searchBooksAdmin');
    };

    const handleSortByChange = (newSortBy) => {
        setSortBy(newSortBy);
        setCurrentPage(0);
        updateLastActivity('sortByBooksAdmin');
    };

    const handleSortOrderChange = (newSortOrder) => {
        setSortOrder(newSortOrder);
        setCurrentPage(0);
        updateLastActivity('sortOrderBooksAdmin');
    };

    const value = {
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
        fetchBooks,
    };

    return <BookAdminContext.Provider value={value}>{children}</BookAdminContext.Provider>;
};