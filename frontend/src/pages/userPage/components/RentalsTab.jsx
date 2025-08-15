import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastSystem';
import { useNavigate } from 'react-router-dom';
import RentalItemList from './RentalItemList';

function RentalsTab() {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');

    const [currentPage, setCurrentPage] = useState(0);
    const [hasNext, setHasNext] = useState(true);
    const [totalElements, setTotalElements] = useState(0);

    const { authToken } = useAuth();
    const { info } = useToast();
    const navigate = useNavigate();
    const observerRef = useRef(null);

    const fetchUserRentals = useCallback(async (page = 0, append = false) => {
        try {
            if (!append) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await fetch(`/api/rentals/my-rentals?page=${page}&size=9`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${authToken}` },
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch rentals');
            }

            const data = await response.json();

            if (append) {
                setRentals(prev => [...prev, ...data.content]);
            } else {
                setRentals(data.content);
            }

            setCurrentPage(data.pageable.pageNumber);
            setHasNext(!data.last);
            setTotalElements(data.totalElements);

        } catch (err) {
            setError('Failed to load rentals');
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [authToken]);

    const loadMore = useCallback(() => {
        if (!loadingMore && hasNext) {
            fetchUserRentals(currentPage + 1, true);
        }
    }, [loadingMore, hasNext, currentPage, fetchUserRentals]);

    const lastRentalElementRef = useCallback((node) => {
        if (loadingMore) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasNext && !loadingMore) {
                loadMore();
            }
        }, {
            threshold: 0.1
        });

        if (node) observerRef.current.observe(node);
    }, [loadingMore, hasNext, loadMore]);

    useEffect(() => {
        if (authToken) {
            fetchUserRentals();
        }
    }, [authToken, fetchUserRentals]);

    if (loading) {
        return (
            <div className="bg-white p-8 rounded-lg shadow w-full max-w-4xl mx-auto">
                <p className="text-center text-lg">Loading your rentals...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-8 rounded-lg shadow w-full max-w-4xl mx-auto">
                <p className="text-center text-red-600 text-lg">{error}</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white p-8 rounded-lg shadow w-full max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h2
                        className="text-3xl font-semibold text-[#321d4f]"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                        Rental History
                    </h2>
                    {totalElements > 0 && (
                        <p
                            className="text-gray-600 mt-2"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                            Total: {totalElements} rental{totalElements !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {rentals.length === 0 ? (
                    <div className="text-center py-12">
                        <p
                            className="text-lg text-gray-600 mb-4"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                            You haven't rented any books yet.
                        </p>
                        <p
                            className="text-sm text-gray-500"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                            Start renting and your rental history will appear here!
                        </p>
                    </div>
                ) : (
                    <RentalItemList
                        rentals={rentals}
                        lastRentalElementRef={lastRentalElementRef}
                        loadingMore={loadingMore}
                        hasNext={hasNext}
                    />
                )}
            </div>
        </>
    );
}

export default RentalsTab;