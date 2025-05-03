import React, { useState, useEffect } from 'react';
import { CatalogProvider } from '../contexts/CatalogContext';
import BookFilter from '../components/BookFilter';
import BookList from '../components/BookList';

const BookCatalogPage = () => {
    const [books, setBooks] = useState([]);
    const [genres, setGenres] = useState([]);
    const [categories, setCategories] = useState([]);

    // Local filter state before applying
    const [filterState, setFilterState] = useState({ genres: [], categories: [], sort: 'asc' });
    // Applied filters used for fetching
    const [appliedFilters, setAppliedFilters] = useState({ genres: [], categories: [], sort: 'asc' });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [customEndpoint, setCustomEndpoint] = useState(null);
    const [pageTitle, setPageTitle] = useState('Book Catalog');

    // Fetch genres & categories once
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

    // Fetch books whenever appliedFilters change or a customEndpoint is set
    useEffect(() => {
        setLoading(true);

        let url;
        if (customEndpoint) {
            url = customEndpoint;
        } else {
            const params = new URLSearchParams();
            appliedFilters.genres.forEach(id => params.append('genres', id));
            appliedFilters.categories.forEach(id => params.append('categories', id));
            if (appliedFilters.sort) params.set('sort', appliedFilters.sort);
            url = `/api/catalog/books?${params.toString()}`;
        }

        fetch(url)
            .then(r => {
                if (!r.ok) {
                    throw new Error(`HTTP error! Status: ${r.status}`);
                }
                return r.json();
            })
            .then(data => setBooks(data))
            .catch(err => {
                console.error('Error fetching books:', err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, [appliedFilters, customEndpoint]);

    const applyFilters = () => {
        // Reset any special category view when applying regular filters
        setCustomEndpoint(null);
        setPageTitle('Book Catalog');
        setAppliedFilters(filterState);
    };

    const handleSpecialCategoryClick = (endpoint, categoryName) => {
        // Reset regular filters when selecting a special category
        setFilterState({ genres: [], categories: [], sort: 'asc' });
        setAppliedFilters({ genres: [], categories: [], sort: 'asc' });

        // Set the custom endpoint and update the page title
        setCustomEndpoint(endpoint);
        setPageTitle(categoryName.split(' ').slice(1).join(' ')); // Remove emoji from title
    };

    const resetToMainCatalog = () => {
        setCustomEndpoint(null);
        setPageTitle('Book Catalog');
        setFilterState({ genres: [], categories: [], sort: 'asc' });
        setAppliedFilters({ genres: [], categories: [], sort: 'asc' });
    };

    if (loading && !books.length) return <div className="text-center p-8">Loading…</div>;
    if (error) return <div className="text-red-600 p-4">Error: {error}</div>;

    return (
        <CatalogProvider>
            <div className="container mx-auto px-6 py-8 flex">
                <div className="w-1/5 bg-white">
                    <BookFilter
                        allGenres={genres}
                        allCategories={categories}
                        filterState={filterState}
                        setFilterState={setFilterState}
                        onSpecialCategoryClick={handleSpecialCategoryClick}
                    />
                    <button
                        onClick={applyFilters}
                        className="mt-4 w-full bg-[#ffbdb1] text-gray-800 font-medium px-4 py-2 rounded-full hover:bg-[#ff9c8b]"
                        disabled={customEndpoint !== null}
                    >
                        Apply Filters
                    </button>
                    {customEndpoint && (
                        <button
                            onClick={resetToMainCatalog}
                            className="mt-2 w-full bg-[#f5f3ff] text-[#4c1d95] font-medium px-4 py-2 rounded-full border border-[#ddd6fe] hover:bg-[#ddd6fe]"
                        >
                            Back to Main Catalog
                        </button>
                    )}
                </div>

                <div className="w-4/5 pl-8">
                    <h1 className="text-4xl font-extrabold mb-8 text-center">{pageTitle}</h1>
                    {loading ? (
                        <div className="text-center p-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#321d4f]"></div>
                            <p className="mt-2 text-[#4a4a4a]">Loading books...</p>
                        </div>
                    ) : (
                        <BookList books={books} />
                    )}
                </div>
            </div>
        </CatalogProvider>
    );
};

export default BookCatalogPage;