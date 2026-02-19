import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CatalogProvider } from '../contexts/CatalogContext';
import { CartProvider, useCart } from '../contexts/CartContext';
import { ToastProvider } from '../contexts/ToastSystem';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastSystem';
import BookFilter from '../components/BookFilter';
import BookList from '../components/BookList';
import Pagination from '../components/Pagination';
import bookabeLogo from '../assets/images/bookabe-logo.jpg';
import { FaShoppingCart } from 'react-icons/fa';

const specialCategories = [
    { categoryId: 'discounts', categoryName: '💸 Discounts', endpoint: '/api/catalog/books/discounts' },
    { categoryId: 'new', categoryName: '🆕 New Releases', endpoint: '/api/catalog/books/new' },
    { categoryId: 'bestsellers', categoryName: '🔥 Bestsellers', endpoint: '/api/catalog/books/bestsellers' }
];

const BOOKS_PER_PAGE = 9;

const CartIcon = () => {
    const { cartCount } = useCart();
    const navigate = useNavigate();

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

const BookCatalogPageContent = () => {
    const [books, setBooks] = useState([]);
    const [genres, setGenres] = useState([]);
    const [categories, setCategories] = useState([]);

    const [filterState, setFilterState] = useState({ genres: [], categories: [], sort: 'asc' });
    const [appliedFilters, setAppliedFilters] = useState({ genres: [], categories: [], sort: 'asc' });

    const [searchQuery, setSearchQuery] = useState('');
    const [appliedSearchQuery, setAppliedSearchQuery] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [customEndpoint, setCustomEndpoint] = useState(null);
    const [pageTitle, setPageTitle] = useState('Book Catalog');
    const [isResetting, setIsResetting] = useState(false);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { authToken, logout } = useAuth();
    const toast = useToast();

    // --- Notification alerts
    useEffect(() => {
        if (!authToken) return;
        if (sessionStorage.getItem('alertsShownCatalog')) return;

        fetch('/api/notifications/alerts', {
            headers: { Authorization: `Bearer ${authToken}` }
        })
            .then(r => r.json())
            .then(data => {
                if (data.hasReadyForPickup) {
                    toast.warning('You have orders ready for pickup! Check your account.');
                }
                if (data.hasOverdueRentals) {
                    toast.warning('You have overdue rentals! Check your account.');
                }
                sessionStorage.setItem('alertsShownCatalog', 'true');
            })
            .catch(() => {});
    }, [authToken]);

    // --- Read URL params
    useEffect(() => {
        const page = parseInt(searchParams.get('page')) || 0;
        const genres = searchParams.get('genres')?.split(',').map(Number).filter(Boolean) || [];
        const categories = searchParams.get('categories')?.split(',').map(Number).filter(Boolean) || [];
        const sort = searchParams.get('sort') || 'asc';
        const category = searchParams.get('category');
        const title = searchParams.get('title') || '';

        setCurrentPage(page);
        setFilterState({ genres, categories, sort });
        setAppliedFilters({ genres, categories, sort });

        setSearchQuery(title);
        setAppliedSearchQuery(title);

        if (category) {
            const specialCategory = specialCategories.find(c => c.categoryId === category);
            if (specialCategory) {
                setCustomEndpoint(specialCategory.endpoint);
                setPageTitle(specialCategory.categoryName.split(' ').slice(1).join(' '));
            }
        }
    }, [searchParams]);

    // --- Load genres & categories
    useEffect(() => {
        Promise.all([
            fetch('/api/genres/').then(r => r.json()),
            fetch('/api/categories/').then(r => r.json())
        ])
            .then(([gData, cData]) => {
                setGenres(gData);
                setCategories(cData);
            })
            .catch(err => setError(err.message));
    }, []);

    // --- Fetch books
    useEffect(() => {
        setLoading(true);

        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('size', BOOKS_PER_PAGE.toString());

        let url;

        if (!customEndpoint) {
            appliedFilters.genres.forEach(id => params.append('genres', id));
            appliedFilters.categories.forEach(id => params.append('categories', id));
            if (appliedFilters.sort) params.set('sort', appliedFilters.sort);

            if (appliedSearchQuery.trim()) {
                params.set('title', appliedSearchQuery.trim());
            }

            url = `/api/catalog/books?${params.toString()}`;
        } else {
            url = `${customEndpoint}?${params.toString()}`;
        }

        fetch(url)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP error! Status: ${r.status}`);
                return r.json();
            })
            .then(data => {
                if (data.books) {
                    setBooks(data.books);
                    setCurrentPage(data.currentPage);
                    setTotalPages(data.totalPages);
                    setTotalElements(data.totalElements);
                } else {
                    setBooks(data);
                    setTotalPages(1);
                    setTotalElements(data.length);
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [appliedFilters, appliedSearchQuery, customEndpoint, currentPage]);

    // --- Sync URL
    useEffect(() => {
        const params = new URLSearchParams();

        if (currentPage > 0) params.set('page', currentPage.toString());

        if (customEndpoint) {
            const category = specialCategories.find(c => c.endpoint === customEndpoint);
            if (category) params.set('category', category.categoryId);
        } else {
            if (appliedSearchQuery.trim()) params.set('title', appliedSearchQuery.trim());
            if (appliedFilters.genres.length) params.set('genres', appliedFilters.genres.join(','));
            if (appliedFilters.categories.length) params.set('categories', appliedFilters.categories.join(','));
            if (appliedFilters.sort !== 'asc') params.set('sort', appliedFilters.sort);
        }

        setSearchParams(params, { replace: true });
    }, [appliedFilters, appliedSearchQuery, customEndpoint, currentPage, setSearchParams]);

    const applyFilters = () => {
        setCustomEndpoint(null);
        setPageTitle('Book Catalog');
        setAppliedFilters(filterState);
        setAppliedSearchQuery(searchQuery);
        setCurrentPage(0);
    };

    const handleSpecialCategoryClick = (endpoint, categoryName) => {
        setFilterState({ genres: [], categories: [], sort: 'asc' });
        setAppliedFilters({ genres: [], categories: [], sort: 'asc' });
        setSearchQuery('');
        setAppliedSearchQuery('');
        setCustomEndpoint(endpoint);
        setPageTitle(categoryName.split(' ').slice(1).join(' '));
        setCurrentPage(0);
    };

    const resetAllFilters = () => {
        setIsResetting(true);
        setCustomEndpoint(null);
        setPageTitle('Book Catalog');
        setFilterState({ genres: [], categories: [], sort: 'asc' });
        setAppliedFilters({ genres: [], categories: [], sort: 'asc' });
        setSearchQuery('');
        setAppliedSearchQuery('');
        setCurrentPage(0);
        setTimeout(() => setIsResetting(false), 300);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const hasActiveFilters = () =>
        customEndpoint !== null ||
        appliedFilters.genres.length > 0 ||
        appliedFilters.categories.length > 0 ||
        appliedFilters.sort !== 'asc' ||
        appliedSearchQuery.trim().length > 0;

    if (error) return <div className="text-red-600 p-4">Error: {error}</div>;

    return (
        <CatalogProvider>
            <header className="pt-8 px-12 flex justify-between items-center">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
                    <img src={bookabeLogo} alt="bookabe logo" className="w-20 h-20 rounded-full object-cover" />
                    <span className="text-[#321d4f] text-5xl font-light tracking-widest">bookabe</span>
                </div>

                <div className="flex items-center gap-6 text-[#321d4f] text-lg font-medium">
                    {authToken ? (
                        <>
                            <CartIcon />
                            <button onClick={() => navigate('/user')} className="hover:underline">My Account</button>
                            <button
                                onClick={() => { logout(); navigate('/logout-success'); }}
                                className="bg-[#321d4f] text-white px-4 py-2 rounded-full hover:bg-[#4a2870]"
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => navigate('/login/user')} className="hover:underline">Log in</button>
                            <button onClick={() => navigate('/register/user')} className="hover:underline">Register</button>
                        </>
                    )}
                </div>
            </header>

            <div className="container mx-auto px-6 py-8 flex">
                <div className="w-1/5">
                    <BookFilter
                        allGenres={genres}
                        allCategories={categories}
                        filterState={filterState}
                        setFilterState={setFilterState}
                        onSpecialCategoryClick={handleSpecialCategoryClick}
                        currentSpecialCategory={
                            customEndpoint
                                ? specialCategories.find(c => c.endpoint === customEndpoint)?.categoryId
                                : null
                        }
                    />
                    <button
                        onClick={applyFilters}
                        disabled={customEndpoint !== null}
                        className="mt-4 w-full bg-[#ffbdb1] px-4 py-2 rounded-full hover:bg-[#ff9c8b] disabled:opacity-50"
                    >
                        Apply Filters
                    </button>
                </div>

                <div className="w-4/5 pl-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-semibold">{pageTitle}</h1>
                            {appliedSearchQuery && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Results for “{appliedSearchQuery}”
                                </p>
                            )}
                            {totalElements > 0 && (
                                <p className="text-gray-600 text-sm mt-2">
                                    Showing {totalElements} {totalElements === 1 ? 'book' : 'books'}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <input
                                type="text"
                                placeholder="Search by title or author"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                                disabled={customEndpoint !== null}
                                className="rounded-full border px-6 py-4 text-base w-full max-w-lg"
                            />
                            <button
                                onClick={applyFilters}
                                disabled={customEndpoint !== null}
                                className="bg-[#321d4f] text-white px-6 py-3 rounded-full hover:bg-[#4a2870]"
                            >
                                Search
                            </button>

                            {hasActiveFilters() && (
                                <button
                                    onClick={resetAllFilters}
                                    disabled={isResetting}
                                    className="ml-4 bg-[#f5f3ff] px-4 py-2 rounded-full"
                                >
                                    Reset All
                                </button>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center p-8">Loading books…</div>
                    ) : (
                        <>
                            <BookList books={books} />
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </>
                    )}
                </div>
            </div>
        </CatalogProvider>
    );
};

const BookCatalogPage = () => (
    <CartProvider>
        <ToastProvider>
            <BookCatalogPageContent />
        </ToastProvider>
    </CartProvider>
);

export default BookCatalogPage;