import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const AdminReferenceContext = createContext();

export const useReferences = () => {
    const context = useContext(AdminReferenceContext);
    if (!context) throw new Error('useReferences must be used within AdminReferenceProvider');
    return context;
};

export const AdminReferenceProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [references, setReferences] = useState({
        authors: [],
        allCategories: [],
        allGenres: [],
        tree: [],
        pickUpPoints: [],
        orderStatuses: [],
        itemStatuses: [],
        isReady: false
    });
    const [loading, setLoading] = useState(false);

    const fetchReferences = useCallback(async () => {
        if (!isAuthenticated) return;

        setLoading(true);
        try {
            const response = await fetch('http://localhost:8081/api/admin/references', {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setReferences({
                    authors: data.authors || [],
                    allCategories: data.allCategories || [],
                    allGenres: data.allGenres || [],
                    tree: data.tree || [],
                    pickUpPoints: data.pickUpPoints || [],
                    orderStatuses: data.orderStatuses || [],
                    itemStatuses: data.itemStatuses || [],
                    isReady: true
                });
            }
        } catch (err) {
            console.error('Failed to fetch references:', err);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchReferences();
    }, [fetchReferences]);

    const getPickUpPointAddress = (id) =>
        references.pickUpPoints.find(p => p.id === id)?.address || 'Unknown Point';

    const formatOrderStatus = (status) => {
        if (!status) return 'Unknown Status';
        return status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ');
    };

    const formatItemStatus = (status) => {
        if (!status) return 'Unknown';
        return status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ');
    };

    const updateAuthor = useCallback((updatedAuthor) => {
        setReferences(prev => ({
            ...prev,
            authors: prev.authors.map(author =>
                author.authorId === updatedAuthor.authorId ? updatedAuthor : author
            )
        }));
    }, []);

    const addAuthor = useCallback((newAuthor) => {
        setReferences(prev => ({
            ...prev,
            authors: [...prev.authors, newAuthor]
        }));
    }, []);

    const getAuthorName = (id) => references.authors.find(a => a.authorId === id)?.fullName || 'Unknown Author';

    const getCategoryNames = (ids) => {
        if (!ids || !ids.length) return 'No Categories';
        return ids.map(id => references.allCategories.find(c => c.categoryId === id)?.name)
            .filter(Boolean).join(', ');
    };

    const getGenreNames = (ids) => {
        if (!ids || !ids.length) return 'No Genres';
        return ids.map(id => references.allGenres.find(g => g.genreId === id)?.name)
            .filter(Boolean).join(', ');
    };

    const value = {
        ...references,
        loading,
        refreshReferences: fetchReferences,
        updateAuthor,
        addAuthor,
        getAuthorName,
        getCategoryNames,
        getGenreNames,
        getPickUpPointAddress,
        formatOrderStatus,
        formatItemStatus
    };

    return (
        <AdminReferenceContext.Provider value={value}>
            {children}
        </AdminReferenceContext.Provider>
    );
};