import React, { useState, useEffect } from 'react';
import genreEmojis from '../utils/genreEmojis';

const BookFilter = ({
                        allGenres,
                        allCategories,
                        filterState,
                        setFilterState,
                        onSpecialCategoryClick,
                        currentSpecialCategory
                    }) => {
    const [openGroup, setOpenGroup] = useState(null);
    const [categoriesWithGenres, setCategoriesWithGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategoriesWithGenres = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/categories/with-genres');
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                setCategoriesWithGenres(await response.json());
                setLoading(false);
            } catch (err) {
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
        const updated = filterState.categories.includes(categoryId)
            ? filterState.categories.filter(id => id !== categoryId)
            : [...filterState.categories, categoryId];
        setFilterState({ ...filterState, categories: updated });
    };

    const handleSpecialClick = (categoryId) => {
        const category = specialCategories.find(c => c.categoryId === categoryId);
        if (category) {
            onSpecialCategoryClick(category.endpoint, category.categoryName);
        }
    };

    if (loading) return <div className="text-center py-4 text-[#4a4a4a]">Loading filters...</div>;
    if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

    return (
        <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-[#f0f0f0]">
            {/* Categories & Genres section */}
            <div>
                <h3 className="text-xl font-medium mb-4 text-[#321d4f]">
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
                            {/* Основная кнопка категории - теперь кликабельная */}
                            <div className="flex items-center">
                                <button
                                    onClick={() => toggleWholeCategory(category.categoryId)}
                                    className={`flex-shrink-0 w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-colors ${
                                        filterState.categories.includes(category.categoryId)
                                            ? 'bg-[#321d4f] border-[#321d4f] text-white'
                                            : 'border-gray-300 hover:border-[#321d4f]'
                                    }`}
                                >
                                    {filterState.categories.includes(category.categoryId) && (
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => toggleWholeCategory(category.categoryId)}
                                    className={`flex-1 text-left px-4 py-3 flex items-center justify-between transition-all rounded-lg ${
                                        filterState.categories.includes(category.categoryId)
                                            ? 'bg-[#f9f5ff] font-medium text-[#321d4f]'
                                            : 'text-[#4a4a4a] hover:bg-[#f9f5ff]'
                                    }`}
                                >
                                    <span>{category.categoryName}</span>
                                    <span className="text-[#a78bfa] transform group-hover:translate-x-1 transition-transform">
                                        →
                                    </span>
                                </button>
                            </div>

                            {/* Выпадающее меню с жанрами */}
                            {openGroup === category.categoryName && category.genres && (
                                <div
                                    className="absolute left-full top-0 bg-white z-10 w-64 py-3 rounded-xl shadow-lg border border-[#f0f0f0] -ml-1"
                                    onMouseEnter={() => setOpenGroup(category.categoryName)}
                                    onMouseLeave={() => setOpenGroup(null)}
                                >
                                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100 mb-2">
                                        Select genres in {category.categoryName}:
                                    </div>
                                    {category.genres.map(genre => (
                                        <button
                                            key={genre.genreId}
                                            onClick={() => toggleSelection(genre.genreId, 'genres')}
                                            className={`w-full text-left px-4 py-2 text-sm transition flex items-center justify-between hover:bg-[#f5f3ff] ${
                                                filterState.genres.includes(genre.genreId)
                                                    ? 'text-[#321d4f] font-medium bg-[#f5f3ff]'
                                                    : 'text-[#4a4a4a]'
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                <span className="mr-2">{genreEmojis[genre.name]}</span>
                                                {genre.name}
                                            </div>
                                            {filterState.genres.includes(genre.genreId) && (
                                                <svg className="w-4 h-4 text-[#321d4f]" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Special Categories section */}
            <div>
                <h3 className="text-xl font-medium mb-4 text-[#321d4f]">
                    Special Categories
                </h3>
                <div className="space-y-2">
                    {specialCategories.map(category => (
                        <button
                            key={category.categoryId}
                            onClick={() => handleSpecialClick(category.categoryId)}
                            className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center ${
                                currentSpecialCategory === category.categoryId
                                    ? 'bg-[#f9f5ff] text-[#321d4f] font-medium'
                                    : 'text-[#4a4a4a] hover:bg-[#f9f5ff] hover:text-[#321d4f]'
                            }`}
                        >
                            <span className="mr-2">{category.categoryName.split(' ')[0]}</span>
                            <span>{category.categoryName.split(' ').slice(1).join(' ')}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Sorting section */}
            <div>
                <h3 className="text-xl font-medium mb-4 text-[#321d4f]">
                    Sort by Price
                </h3>
                <select
                    value={filterState.sort}
                    onChange={e => setFilterState({ ...filterState, sort: e.target.value })}
                    className="w-full rounded-lg border border-[#e0e0e0] px-4 py-3 shadow-sm focus:border-[#ffbdb1] focus:ring-1 focus:ring-[#ffbdb1] transition text-[#4a4a4a]"
                >
                    <option value="asc">Low to High</option>
                    <option value="desc">High to Low</option>
                </select>
            </div>

            {/* Selected filters display */}
            {(filterState.categories.length > 0 || filterState.genres.length > 0) && (
                <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Filters:</h4>
                    <div className="flex flex-wrap gap-2">
                        {filterState.categories.map(categoryId => {
                            const category = categoriesWithGenres.find(c => c.categoryId === categoryId);
                            return category ? (
                                <span
                                    key={categoryId}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#321d4f] text-white"
                                >
                                    {category.categoryName}
                                    <button
                                        onClick={() => toggleWholeCategory(categoryId)}
                                        className="ml-1 text-white hover:text-gray-200"
                                    >
                                        ×
                                    </button>
                                </span>
                            ) : null;
                        })}
                        {filterState.genres.map(genreId => {
                            const genre = categoriesWithGenres
                                .flatMap(c => c.genres || [])
                                .find(g => g.genreId === genreId);
                            return genre ? (
                                <span
                                    key={genreId}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#4c1d95] text-white"
                                >
                                    {genreEmojis[genre.name]} {genre.name}
                                    <button
                                        onClick={() => toggleSelection(genreId, 'genres')}
                                        className="ml-1 text-white hover:text-gray-200"
                                    >
                                        ×
                                    </button>
                                </span>
                            ) : null;
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const specialCategories = [
    { categoryId: 'discounts', categoryName: '💸 Discounts', endpoint: '/api/catalog/books/discounts' },
    { categoryId: 'new', categoryName: '🆕 New Releases', endpoint: '/api/catalog/books/new' },
    { categoryId: 'bestsellers', categoryName: '🔥 Bestsellers', endpoint: '/api/catalog/books/bestsellers' }
];

export default BookFilter;