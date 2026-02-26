import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = React.memo(({ children }) => {
    const { isAuthenticated, isLoading, updateLastActivity } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            updateLastActivity();
        }
    }, [isAuthenticated, updateLastActivity]);

    if (isLoading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
});

export default ProtectedRoute;