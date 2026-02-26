import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useReferences } from '../contexts/AdminReferenceContext';
import { ToastProvider } from '../components/shared/ToastSystem';
import InactivityTimer from '../components/shared/InactivityTimer';

import AdminOrdersView from '../components/views/orders/AdminOrdersView';
import WorkerOrdersView from '../components/views/orders/WorkerOrdersView';

const ManageOrdersPageContent = () => {
    const { userInfo, isLoading, updateLastActivity } = useAuth();
    const { isReady } = useReferences();

    const handleBackToDashboard = () => {
        updateLastActivity('navigateToDashboard');
        window.location.href = '/dashboard';
    };

    if (isLoading || !isReady) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    const userRole = userInfo?.role || 'WORKER';

    return (
        <div className="container mt-4">
            <InactivityTimer />

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>Order Management</h2>
                    <p className="text-muted mb-0">View and manage customer orders</p>
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={handleBackToDashboard}
                >
                    ← Back to Dashboard
                </button>
            </div>

            {userRole === 'ADMIN' ? (
                <AdminOrdersView />
            ) : (
                <WorkerOrdersView pickUpPoint={userInfo?.pickUpPoint} />
            )}
        </div>
    );
};

const ManageOrdersPage = () => (
    <ToastProvider>
        <ManageOrdersPageContent />
    </ToastProvider>
);

export default ManageOrdersPage;