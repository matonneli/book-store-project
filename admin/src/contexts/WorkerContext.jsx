import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '../components/shared/ToastSystem';

const WorkerContext = createContext();

export const useWorkers = () => {
    const context = useContext(WorkerContext);
    if (!context) throw new Error('useWorkers must be used within WorkerProvider');
    return context;
};

export const WorkerProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const { success, error } = useToast();
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWorkers = useCallback(async () => {
        if (!isAuthenticated) return;

        setLoading(true);
        try {
            const response = await fetch('http://localhost:8081/api/admin/workers', {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setWorkers(data);
            } else {
                const errorData = await response.json();
                error(errorData.message || 'Failed to fetch workers');
            }
        } catch (err) {
            console.error('Failed to fetch workers:', err);
            error('Network error while fetching workers');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, error]);

    const createWorker = useCallback(async (workerData) => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8081/api/admin/workers', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(workerData),
            });

            if (response.ok) {
                const newWorker = await response.json();
                setWorkers(prev => [...prev, newWorker]);
                success('Worker created successfully');
                return { success: true, worker: newWorker };
            } else {
                const errorData = await response.json();
                error(errorData.message || 'Failed to create worker');
                return { success: false, message: errorData.message };
            }
        } catch (err) {
            console.error('Failed to create worker:', err);
            error('Network error while creating worker');
            return { success: false, message: 'Network error' };
        } finally {
            setLoading(false);
        }
    }, [success, error]);

    const updateWorker = useCallback(async (adminId, workerData) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8081/api/admin/workers/${adminId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(workerData),
            });

            if (response.ok) {
                const updatedWorker = await response.json();
                setWorkers(prev => prev.map(w => w.adminId === adminId ? updatedWorker : w));
                success('Worker updated successfully');
                return { success: true, worker: updatedWorker };
            } else {
                const errorData = await response.json();
                error(errorData.message || 'Failed to update worker');
                return { success: false, message: errorData.message };
            }
        } catch (err) {
            console.error('Failed to update worker:', err);
            error('Network error while updating worker');
            return { success: false, message: 'Network error' };
        } finally {
            setLoading(false);
        }
    }, [success, error]);

    const deleteWorker = useCallback(async (adminId) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8081/api/admin/workers/${adminId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                setWorkers(prev => prev.filter(w => w.adminId !== adminId));
                success('Worker deleted successfully');
                return { success: true };
            } else {
                const errorData = await response.json();
                error(errorData.message || 'Failed to delete worker');
                return { success: false, message: errorData.message };
            }
        } catch (err) {
            console.error('Failed to delete worker:', err);
            error('Network error while deleting worker');
            return { success: false, message: 'Network error' };
        } finally {
            setLoading(false);
        }
    }, [success, error]);

    const value = {
        workers,
        loading,
        fetchWorkers,
        createWorker,
        updateWorker,
        deleteWorker,
    };

    return (
        <WorkerContext.Provider value={value}>
            {children}
        </WorkerContext.Provider>
    );
};