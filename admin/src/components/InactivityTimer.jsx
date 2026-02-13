import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const InactivityTimer = () => {
    const { getRemainingTime, updateLastActivity } = useAuth();
    const [remaining, setRemaining] = useState(getRemainingTime());
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const timeLeft = getRemainingTime();
            setRemaining(timeLeft);
            if (timeLeft <= 5 * 60 * 1000 && timeLeft > 0 && !showModal) {
                setShowModal(true);
            }
            if (timeLeft <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [getRemainingTime, showModal]);

    const handleContinue = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/admin/auth-status', { credentials: 'include' });
            if (response.ok) {
                updateLastActivity('modal continue');
                setShowModal(false);
            }
        } catch (err) {
            console.error('Failed to extend session:', err);
        }
    };

    const formatTimeLeft = () => {
        const minutes = Math.floor(remaining / 1000 / 60);
        const seconds = Math.floor((remaining / 1000) % 60);
        return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
    };

    return (
        <div>
            <div className="alert alert-info mb-0" role="alert">
                <small>
                    Inactivity time: {formatTimeLeft()}
                    {remaining <= 5 * 60 * 1000 && (
                        <span className="ms-2 text-danger">
                            (Session will expire in 5 minutes, please take action or login again)
                        </span>
                    )}
                </small>
            </div>
            {showModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Session will expire soon</h5>
                            </div>
                            <div className="modal-body">
                                <p>Your session will expire in {formatTimeLeft()}. Continue working?</p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-primary" onClick={handleContinue}>
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InactivityTimer;