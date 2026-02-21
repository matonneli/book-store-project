import React, { createContext, useContext, useState, useCallback } from 'react';

const AnalyticsContext = createContext();

export const useAnalytics = () => {
    const context = useContext(AnalyticsContext);
    if (!context) {
        throw new Error('useAnalytics must be used within an AnalyticsProvider');
    }
    return context;
};

const API_BASE = 'http://localhost:8081/api/analytics';

export const AnalyticsProvider = ({ children }) => {
    const [overallData, setOverallData]         = useState(null);
    const [periodData, setPeriodData]           = useState(null);
    const [pickupPointData, setPickupPointData] = useState(null);

    const [loadingOverall, setLoadingOverall]           = useState(false);
    const [loadingPeriod, setLoadingPeriod]             = useState(false);
    const [loadingPickupPoint, setLoadingPickupPoint]   = useState(false);

    const [error, setError] = useState(null);

    const fetchOverall = useCallback(async () => {
        if (overallData) return; // cache — don't refetch on tab switch
        setLoadingOverall(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/overview`, { credentials: 'include' });
            if (!res.ok) throw new Error(`Failed to fetch overview: ${res.status}`);
            setOverallData(await res.json());
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoadingOverall(false);
        }
    }, [overallData]);

    const fetchPeriod = useCallback(async (days) => {
        setLoadingPeriod(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/period?days=${days}`, { credentials: 'include' });
            if (!res.ok) throw new Error(`Failed to fetch period: ${res.status}`);
            setPeriodData(await res.json());
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoadingPeriod(false);
        }
    }, []);

    const fetchPickupPoint = useCallback(async (pickupPointId) => {
        setLoadingPickupPoint(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/pickup-point?pickupPointId=${pickupPointId}`, {
                credentials: 'include',
            });
            if (!res.ok) throw new Error(`Failed to fetch pickup point stats: ${res.status}`);
            setPickupPointData(await res.json());
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoadingPickupPoint(false);
        }
    }, []);

    const value = {
        overallData,
        periodData,
        pickupPointData,
        loadingOverall,
        loadingPeriod,
        loadingPickupPoint,
        error,
        fetchOverall,
        fetchPeriod,
        fetchPickupPoint,
    };

    return (
        <AnalyticsContext.Provider value={value}>
            {children}
        </AnalyticsContext.Provider>
    );
};