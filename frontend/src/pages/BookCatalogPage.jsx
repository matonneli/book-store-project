import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { CatalogProvider } from '../contexts/CatalogContext';
import { CartProvider, useCart } from '../contexts/CartContext';
import { ToastProvider } from '../contexts/ToastSystem';
import { useAuth } from '../contexts/AuthContext';
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [customEndpoint, setCustomEndpoint] = useState(null);
    const [pageTitle, setPageTitle] = useState('Book Catalog');
    const [isResetting, setIsResetting] = useState(false);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { authToken, logout } = useAuth();

    useEffect(() => {
        const page = parseInt(searchParams.get('page')) || 0;
        const genres = searchParams.get('genres')?.split(',').map(id => parseInt(id)).filter(id => !isNaN(id)) || [];
        const categories = searchParams.get('categories')?.split(',').map(id => parseInt(id)).filter(id => !isNaN(id)) || [];
        const sort = searchParams.get('sort') || 'asc';
        const category = searchParams.get('category');

        setCurrentPage(page);
        setFilterState({ genres, categories, sort });
        setAppliedFilters({ genres, categories, sort });

        if (category) {
            const specialCategory = specialCategories.find(c => c.categoryId === category);
            if (specialCategory) {
                setCustomEndpoint(specialCategory.endpoint);
                setPageTitle(specialCategory.categoryName.split(' ').slice(1).join(' '));
            }
        }
    }, [searchParams]);

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

    useEffect(() => {
        setLoading(true);

        let url;
        if (customEndpoint) {
            const params = new URLSearchParams();
            params.set('page', currentPage.toString());
            params.set('size', BOOKS_PER_PAGE.toString());
            url = `${customEndpoint}?${params.toString()}`;
        } else {
            const params = new URLSearchParams();
            appliedFilters.genres.forEach(id => params.append('genres', id));
            appliedFilters.categories.forEach(id => params.append('categories', id));
            if (appliedFilters.sort) params.set('sort', appliedFilters.sort);
            params.set('page', currentPage.toString());
            params.set('size', BOOKS_PER_PAGE.toString());
            url = `/api/catalog/books?${params.toString()}`;
        }

        fetch(url)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP error! Status: ${r.status}`);
                return r.json();
            })
            .then(data => {
                if (data.books) {
                    // Ответ с пагинацией
                    setBooks(data.books);
                    setCurrentPage(data.currentPage);
                    setTotalPages(data.totalPages);
                    setTotalElements(data.totalElements);
                } else {
                    // Старый формат ответа (без пагинации)
                    setBooks(data);
                    setTotalPages(1);
                    setTotalElements(data.length);
                }
            })
            .catch(err => {
                console.error('Error fetching books:', err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, [appliedFilters, customEndpoint, currentPage]);

    // Обновление URL при изменении параметров
    useEffect(() => {
        const params = new URLSearchParams();

        if (currentPage > 0) {
            params.set('page', currentPage.toString());
        }

        if (customEndpoint) {
            const category = specialCategories.find(c => c.endpoint === customEndpoint);
            if (category) params.set('category', category.categoryId);
        } else {
            if (appliedFilters.genres.length) params.set('genres', appliedFilters.genres.join(','));
            if (appliedFilters.categories.length) params.set('categories', appliedFilters.categories.join(','));
            if (appliedFilters.sort && appliedFilters.sort !== 'asc') params.set('sort', appliedFilters.sort);
        }

        setSearchParams(params, { replace: true });
    }, [appliedFilters, customEndpoint, currentPage, setSearchParams]);

    const applyFilters = () => {
        setCustomEndpoint(null);
        setPageTitle('Book Catalog');
        setAppliedFilters(filterState);
        setCurrentPage(0);
    };

    const handleSpecialCategoryClick = (endpoint, categoryName) => {
        setFilterState({ genres: [], categories: [], sort: 'asc' });
        setAppliedFilters({ genres: [], categories: [], sort: 'asc' });
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
        setCurrentPage(0);

        setTimeout(() => setIsResetting(false), 300);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const hasActiveFilters = () => {
        return (
            customEndpoint !== null ||
            appliedFilters.genres.length > 0 ||
            appliedFilters.categories.length > 0 ||
            appliedFilters.sort !== 'asc'
        );
    };

    if (loading && !books.length) return (
        <div className="text-center p-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#321d4f]"></div>
            <p className="mt-2 text-[#4a4a4a]">Loading initial data...</p>
        </div>
    );

    if (error) return (
        <div className="text-red-600 p-4">
            Error: {error}
            <button
                onClick={() => window.location.reload()}
                className="ml-4 text-blue-600 hover:underline"
            >
                Try again
            </button>
        </div>
    );

    return (
        <CatalogProvider>
            <header className="pt-8 px-12 flex justify-between items-center">
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
                        className="text-[#321d4f] text-5xl"
                        style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: 300,
                            letterSpacing: '2px'
                        }}
                    >
                        bookabe
                    </span>
                </div>

                <div className="flex items-center gap-6 text-[#321d4f] text-lg font-medium">
                    {authToken ? (
                        <>
                            <div className="flex items-center gap-6">
                                <CartIcon />

                                <button
                                    onClick={() => navigate('/user')}
                                    className="hover:underline text-[#321d4f]"
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
                            </div>
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

            <div className="container mx-auto px-6 py-8 flex">
                <div className="w-1/5 bg-white">
                    <BookFilter
                        allGenres={genres}
                        allCategories={categories}
                        filterState={filterState}
                        setFilterState={setFilterState}
                        onSpecialCategoryClick={handleSpecialCategoryClick}
                        currentSpecialCategory={customEndpoint
                            ? specialCategories.find(c => c.endpoint === customEndpoint)?.categoryId
                            : null
                        }
                    />
                    <button
                        onClick={applyFilters}
                        className={`mt-4 w-full bg-[#ffbdb1] text-gray-800 font-medium px-4 py-2 rounded-full hover:bg-[#ff9c8b] transition-all ${
                            customEndpoint !== null ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={customEndpoint !== null}
                    >
                        Apply Filters
                    </button>
                </div>

                <div className="w-4/5 pl-8">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex flex-col">
                            <h1 className="text-4xl font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>{pageTitle}</h1>
                            {totalElements > 0 && (
                                <p className="text-gray-600 text-sm mt-2">
                                    Found {totalElements} {totalElements === 1 ? 'book' : totalElements < 5 ? 'books' : 'books'}
                                </p>
                            )}
                        </div>
                        {hasActiveFilters() && (
                            <button
                                onClick={resetAllFilters}
                                disabled={isResetting}
                                className={`flex items-center bg-[#f5f3ff] text-[#4c1d95] font-medium px-4 py-2 rounded-full border border-[#ddd6fe] hover:bg-[#ddd6fe] transition-all ${
                                    isResetting ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-5 w-5 mr-2 ${isResetting ? 'animate-spin' : ''}`}
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                </svg>
                                {isResetting ? 'Resetting...' : 'Reset All Filters'}
                            </button>
                        )}
                    </div>

                    <div className={`transition-opacity duration-300 ${isResetting ? 'opacity-50' : 'opacity-100'}`}>
                        {loading ? (
                            <div className="text-center p-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#321d4f]"></div>
                                <p className="mt-2 text-[#4a4a4a]">Loading books...</p>
                            </div>
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
            </div>
        </CatalogProvider>
    );
};

const BookCatalogPage = () => {
    return (
        <CartProvider>
            <ToastProvider>
                <BookCatalogPageContent />
            </ToastProvider>
        </CartProvider>
    );
};

export default BookCatalogPage;