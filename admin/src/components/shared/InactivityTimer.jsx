import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const WARNING_THRESHOLD = 5 * 60 * 1000;
const CHECK_INTERVAL = 30 * 1000;

const InactivityTimer = () => {
    const { getRemainingTime, updateLastActivity, checkAuthStatus } = useAuth();
    const [showWarning, setShowWarning] = useState(false);
    const [remaining, setRemaining] = useState(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const check = () => {
            const timeLeft = getRemainingTime();
            if (timeLeft <= WARNING_THRESHOLD) {
                setRemaining(timeLeft);
                if (dismissed && timeLeft < WARNING_THRESHOLD - 10000) {
                    setDismissed(false);
                }
                setShowWarning(true);
            } else {
                setShowWarning(false);
                setRemaining(null);
                setDismissed(false);
            }
        };

        check();
        const interval = setInterval(check, CHECK_INTERVAL);
        return () => clearInterval(interval);
    }, [getRemainingTime, dismissed]);

    const handleExtend = useCallback(async () => {
        try {
            await checkAuthStatus();
            updateLastActivity('extend session');
            setShowWarning(false);
            setDismissed(false);
        } catch (err) {
            console.error('Failed to extend session:', err);
        }
    }, [checkAuthStatus, updateLastActivity]);

    const handleDismiss = useCallback(() => {
        setDismissed(true);
        setShowWarning(false);
    }, []);

    const formatTime = (ms) => {
        if (!ms) return '...';
        const minutes = Math.floor(ms / 1000 / 60);
        const seconds = Math.floor((ms / 1000) % 60);
        return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
    };

    if (!showWarning || dismissed) return null;

    return (
        <div
            className="alert alert-warning alert-dismissible d-flex justify-content-between align-items-center mb-3"
            role="alert"
            style={{ borderLeft: '4px solid #ffc107' }}
        >
            <div>
                ⚠️ Your session will expire in <strong>{formatTime(remaining)}</strong>.
                <span className="ms-1 text-muted small">Click "Extend" to continue working.</span>
            </div>
            <div className="d-flex gap-2 ms-3">
                <button className="btn btn-sm btn-warning" onClick={handleExtend}>
                    Extend Session
                </button>
                <button
                    type="button"
                    className="btn-close"
                    onClick={handleDismiss}
                    aria-label="Dismiss"
                />
            </div>
        </div>
    );
};

export default InactivityTimer;