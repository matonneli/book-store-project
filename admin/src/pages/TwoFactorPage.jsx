import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const TwoFactorPage = () => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { checkAuthStatus } = useAuth();

    const username = location.state?.username;

    useEffect(() => {
        if (!username) navigate('/login');
    }, [username, navigate]);

    const handleVerify = async () => {
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8081/api/admin/2fa-verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `username=${encodeURIComponent(username)}&code=${encodeURIComponent(code)}`,
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                await checkAuthStatus(); // подтягиваем реальное состояние с сервера
                navigate('/dashboard');
                setCode('');
            } else {
                setError(data.message || 'Verification failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && code.length === 6) handleVerify();
    };

    const handleCodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 6) setCode(value);
    };

    const handleBackToLogin = () => navigate('/login');

    if (!username) return null;

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="mb-0">🔐 Two-Factor Authentication</h4>
                        </div>
                        <div className="card-body">
                            <p className="text-muted mb-3">
                                Enter the 6-digit code sent to your email for <strong>{username}</strong>
                            </p>
                            <div className="mb-3">
                                <label htmlFor="code" className="form-label">2FA Code</label>
                                <input
                                    type="text"
                                    className="form-control text-center"
                                    id="code"
                                    value={code}
                                    onChange={handleCodeChange}
                                    onKeyPress={handleKeyPress}
                                    maxLength="6"
                                    disabled={loading}
                                    style={{ fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                                />
                                <div className="form-text">6 digits only</div>
                            </div>
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}
                            <div className="d-grid gap-2">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleVerify}
                                    disabled={loading || code.length !== 6}
                                >
                                    {loading ? 'Verifying...' : 'Verify Code'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={handleBackToLogin}
                                    disabled={loading}
                                >
                                    Back to Login
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorPage;
