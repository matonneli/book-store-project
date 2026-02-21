import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AnalyticsProvider } from '../contexts/AnalyticsContext';
import InactivityTimer from '../components/InactivityTimer';
import OverallView from '../components/views/analytics/OverallView';
import PeriodView from '../components/views/analytics/PeriodView';
import PickupPointView from '../components/views/analytics/PickupPointView';

const AnalyticsPageContent = () => {
    const { userInfo, updateLastActivity } = useAuth();
    const isWorker = userInfo?.role === 'WORKER';
    const isAdmin  = userInfo?.role === 'ADMIN';

    const [activeTab, setActiveTab] = useState(isWorker ? 'pickup' : 'overall');

    const handleBack = () => {
        updateLastActivity('navigateToDashboard');
        window.location.href = '/dashboard';
    };

    if (!isAdmin && !isWorker) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    Access denied.
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <InactivityTimer />

            {/* ── Page header ── */}
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <div>
                        <h4 className="mb-0">Analytics</h4>
                        <small className="text-muted">Store performance overview</small>
                    </div>
                    <button className="btn btn-outline-secondary btn-sm" onClick={handleBack}>
                        ← Back to Dashboard
                    </button>
                </div>
            </div>

            <ul className="nav nav-tabs mb-4">
                {isAdmin && (
                    <>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'overall' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overall')}
                            >
                                Overall
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'period' ? 'active' : ''}`}
                                onClick={() => setActiveTab('period')}
                            >
                                By Period
                            </button>
                        </li>
                    </>
                )}

                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'pickup' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pickup')}
                    >
                        Pickup Point
                    </button>
                </li>
            </ul>

            {activeTab === 'overall' && <OverallView />}
            {activeTab === 'period'  && <PeriodView />}
            {activeTab === 'pickup'  && <PickupPointView />}
        </div>
    );
};

const AnalyticsPage = () => (
    <AnalyticsProvider>
        <AnalyticsPageContent />
    </AnalyticsProvider>
);

export default AnalyticsPage;