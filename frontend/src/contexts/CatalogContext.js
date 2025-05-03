import React, { createContext, useState, useContext } from 'react';

const CatalogContext = createContext();
export const useCatalog = () => useContext(CatalogContext);

export const CatalogProvider = ({ children }) => {
    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

    return (
        <CatalogContext.Provider
            value={{ sortOrder, setSortOrder, selectedGenres, setSelectedGenres, selectedCategories, setSelectedCategories }}
        >
            {children}
        </CatalogContext.Provider>
    );
};