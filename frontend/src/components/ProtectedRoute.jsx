import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
    const { authToken } = useAuth();

    if (!authToken) {
        return <Navigate to="/login/user" replace />;
    }

    return children;
}

export default ProtectedRoute;
