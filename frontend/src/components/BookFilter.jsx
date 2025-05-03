import React, { useState, useEffect } from 'react';
import genreEmojis from '../utils/genreEmojis';

const specialCategories = [
    { categoryId: 'discounts', categoryName: '💸 Discounts', endpoint: '/api/catalog/books/discounts' },
    { categoryId: 'new', categoryName: '🆕 New Releases', endpoint: '/api/catalog/books/new' },
    { categoryId: 'bestsellers', categoryName: '🔥 Bestsellers', endpoint: '/api/catalog/books/bestsellers' }
];

const BookFilter = ({ allGenres, allCategories, filterState, setFilterState, onSpecialCategoryClick }) => {
    const { genres, categories, sort } = filterState;
    const [openGroup, setOpenGroup] = useState(null);
    const [categoriesWithGenres, setCategoriesWithGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategoriesWithGenres = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/categories/with-genres');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setCategoriesWithGenres(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching categories with genres:', err);
                setError('Failed to load categories and genres');
                setLoading(false);
            }
        };

        fetchCategoriesWithGenres();
    }, []);

    const toggleSelection = (id, key) => {
        const list = filterState[key];
        const updated = list.includes(id) ? list.filter(x => x !== id) : [...list, id];
        setFilterState({ ...filterState, [key]: updated });
    };

    const toggleWholeCategory = (categoryId) => {
        const updated = categories.includes(categoryId)
            ? categories.filter(id => id !== categoryId)
            : [...categories, categoryId];
        setFilterState({ ...filterState, categories: updated });
    };

    const handleSpecialCategoryClick = (endpoint, categoryName) => {
        onSpecialCategoryClick(endpoint, categoryName);
    };

    if (loading) return (
        <div className="text-center py-4 text-[#4a4a4a]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Loading filters...
        </div>
    );

    if (error) return (
        <div className="text-center text-red-500 py-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {error}
        </div>
    );

    return (
        <div
            className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-[#f0f0f0]"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
            {/* Categories & Genres */}
            <div>
                <h3
                    className="text-xl font-medium mb-4 text-[#321d4f]"
                    style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 300, letterSpacing: '0.5px' }}
                >
                    Categories & Genres
                </h3>
                <div className="relative space-y-2">
                    {categoriesWithGenres.map(category => (
                        <div
                            key={category.categoryId}
                            className="relative group"
                            onMouseEnter={() => setOpenGroup(category.categoryName)}
                            onMouseLeave={() => setOpenGroup(null)}
                        >
                            <button
                                type="button"
                                className={`w-full text-left px-4 py-3 flex items-center justify-between transition-all rounded-lg hover:bg-[#f9f5ff] ${
                                    categories.includes(category.categoryId)
                                        ? 'bg-[#f9f5ff] font-medium text-[#321d4f]'
                                        : 'text-[#4a4a4a]'
                                }`}
                            >
                                <span>{category.categoryName}</span>
                                <span className="text-[#a78bfa] transform group-hover:translate-x-1 transition-transform">
                                    →
                                </span>
                            </button>

                            {openGroup === category.categoryName && category.genres && (
                                <div
                                    className="absolute left-full top-0 bg-white z-10 w-64 py-3 rounded-xl shadow-lg border border-[#f0f0f0] ml-1"
                                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                                >
                                    {category.genres.map(genre => (
                                        <button
                                            key={genre.genreId}
                                            onClick={() => toggleSelection(genre.genreId, 'genres')}
                                            className={`w-full text-left px-4 py-2 text-sm transition flex items-center ${
                                                genres.includes(genre.genreId)
                                                    ? 'text-[#321d4f] font-medium'
                                                    : 'text-[#4a4a4a] hover:text-[#321d4f]'
                                            }`}
                                        >
                                            <span className="mr-2">{genreEmojis[genre.name]}</span>
                                            {genre.name}
                                        </button>
                                    ))}

                                    <div className="mt-2 pt-2 border-t border-[#f0f0f0] px-4">
                                        <button
                                            onClick={() => toggleWholeCategory(category.categoryId)}
                                            className={`w-full text-left text-sm py-2 flex items-center ${
                                                categories.includes(category.categoryId)
                                                    ? 'text-[#ef4444] hover:text-[#dc2626]'
                                                    : 'text-[#10b981] hover:text-[#059669]'
                                            }`}
                                        >
                                            {categories.includes(category.categoryId) ? (
                                                <>
                                                    <span className="mr-2">❌</span>
                                                    <span>Unselect category</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="mr-2">✅</span>
                                                    <span>Select whole category</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Special Categories */}
            <div>
                <h3
                    className="text-xl font-medium mb-4 text-[#321d4f]"
                    style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 300, letterSpacing: '0.5px' }}
                >
                    Special Categories
                </h3>
                <div className="space-y-2">
                    {specialCategories.map(category => (
                        <button
                            key={category.categoryId}
                            onClick={() => handleSpecialCategoryClick(category.endpoint, category.categoryName)}
                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-[#f9f5ff] transition text-[#4a4a4a] hover:text-[#321d4f] flex items-center"
                        >
                            <span className="mr-2">{category.categoryName.split(' ')[0]}</span>
                            <span>{category.categoryName.split(' ').slice(1).join(' ')}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Sorting */}
            <div>
                <h3
                    className="text-xl font-medium mb-4 text-[#321d4f]"
                    style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 300, letterSpacing: '0.5px' }}
                >
                    Sort by Price
                </h3>
                <select
                    value={sort}
                    onChange={e => setFilterState({ ...filterState, sort: e.target.value })}
                    className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 shadow-sm focus:border-[#ffbdb1] focus:ring-1 focus:ring-[#ffbdb1] transition text-[#4a4a4a]"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                    <option value="asc">Low to High</option>
                    <option value="desc">High to Low</option>
                </select>
            </div>
        </div>
    );
};

export default BookFilter;