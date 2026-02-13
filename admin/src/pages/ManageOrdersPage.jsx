import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useReferences } from '../contexts/AdminReferenceContext';
import { ToastProvider } from '../components/ToastSystem';

import AdminOrdersView from '../components/AdminOrdersView';
import WorkerOrdersView from '../components/WorkerOrdersView';

const ManageOrdersPageContent = () => {
    const navigate = useNavigate();
    const { userInfo, isLoading } = useAuth();
    const { isReady } = useReferences();


    if (isLoading || !isReady) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <div className="spinner-border text-primary" />
            </div>
        );
    }

    const userRole = userInfo?.role || 'WORKER';

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>📦 Order Management</h2>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/dashboard')}
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