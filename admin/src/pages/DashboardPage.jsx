import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import InactivityTimer from '../components/InactivityTimer';
import bookabeLogo from '../assets/images/bookabe-logo.png';

const DashboardPage = () => {
    const [loading, setLoading] = useState(false);
    const [testResult, setTestResult] = useState('');
    const navigate = useNavigate();
    const { userInfo, logout, updateLastActivity, isLoading } = useAuth();

    const formatLoginTime = () => {
        const timestamp = sessionStorage.getItem('adminLoginTime');
        if (!timestamp) return 'Unknown';
        return new Date(parseInt(timestamp)).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    useEffect(() => {
        if (!sessionStorage.getItem('adminLoginTime')) {
            sessionStorage.setItem('adminLoginTime', Date.now().toString());
        }
    }, []);

    const testProtectedEndpoint = async () => {
        setLoading(true);
        setTestResult('');

        try {
            const response = await fetch('http://localhost:8081/api/admin/dashboard', {
                credentials: 'include',
            });

            const text = await response.text();

            if (response.ok) {
                setTestResult(`✅ Success: ${text}`);
                updateLastActivity('testProtectedEndpoint');
            } else {
                setTestResult(`❌ Error (${response.status}): ${text}`);
                if (response.status === 401) {
                    await logout();
                    navigate('/login');
                }
            }
        } catch (err) {
            setTestResult('❌ Network error');
        } finally {
            setLoading(false);
        }
    };

    const renderPickupPointInfo = (pickUpPoint) => {
        if (!pickUpPoint) return null;
        return (
            <div className="mt-3">
                <h6 className="mb-2">📍 Assigned Pickup Point</h6>
                <ul className="list-unstyled mb-0">
                    <li><strong>Name:</strong> {pickUpPoint.name}</li>
                    <li><strong>Address:</strong> {pickUpPoint.address}</li>
                    {pickUpPoint.contactPhone && (
                        <li><strong>Phone:</strong> {pickUpPoint.contactPhone}</li>
                    )}
                    {pickUpPoint.workingHours && (
                        <li><strong>Hours:</strong> {pickUpPoint.workingHours}</li>
                    )}
                    <li><strong>Status:</strong>
                        <span className={`badge ms-1 ${pickUpPoint.isActive ? 'bg-success' : 'bg-danger'}`}>
                            {pickUpPoint.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </li>
                </ul>
            </div>
        );
    };

    const renderAdminFeatures = () => {
        if (!userInfo || userInfo.role !== 'ADMIN') return null;
        return (
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">🚧 Admin Features</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3">
                                    <button
                                        className="btn btn-outline-primary w-100 mb-2"
                                        onClick={() => {
                                            navigate('/manage-books');
                                            updateLastActivity('navigate to manage-books');
                                        }}
                                    >
                                        📖 Manage Books
                                    </button>
                                </div>
                                <div className="col-md-3">
                                    <button
                                        className="btn btn-outline-primary w-100 mb-2"
                                        onClick={() => {
                                            navigate('/manage-orders');
                                            updateLastActivity('navigate to manage-orders');
                                        }}
                                    >
                                        🛒 Manage Orders
                                    </button>
                                </div>
                                <div className="col-md-3">
                                    <button className="btn btn-outline-primary w-100 mb-2" disabled>
                                        👥 User Management
                                    </button>
                                </div>
                                <div className="col-md-3">
                                    <button className="btn btn-outline-primary w-100 mb-2" disabled>
                                        📊 Analytics
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderWorkerFeatures = () => {
        if (!userInfo || userInfo.role !== 'WORKER') return null;
        return (
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">🚧 Worker Features</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <button
                                        className="btn btn-outline-primary w-100 mb-2"
                                        onClick={() => {
                                            navigate('/manage-orders');
                                            updateLastActivity('navigate to manage-orders');
                                        }}
                                    >
                                        🛒 View Orders
                                    </button>
                                </div>
                                <div className="col-md-6">
                                    <button className="btn btn-outline-primary w-100 mb-2" disabled>
                                        📊 Analytics
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (!userInfo || isLoading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-12">
                    <div className="card mb-4">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <img
                                    src={bookabeLogo}
                                    alt="bookabe logo"
                                    className="rounded-circle me-3"
                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                />
                                <h2 className="mb-0">bookabe Admin Panel</h2>
                            </div>
                            <button
                                className="btn btn-outline-danger"
                                onClick={() => {
                                    logout();
                                    navigate('/login');
                                }}
                            >
                                Logout
                            </button>
                        </div>
                        <div className="card-body">
                            <div className="alert alert-success mb-2" role="alert">
                                <strong>Welcome, {userInfo?.fullName || 'Admin'}!</strong> You are successfully authenticated.
                                <br />
                                <small className="text-muted">Session started: {formatLoginTime()}</small>
                            </div>
                            <InactivityTimer />
                        </div>
                    </div>

                    <div className="row mb-4">
                        <div className="col-md-8">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="mb-0">🔒 Test Protected Endpoint</h5>
                                </div>
                                <div className="card-body">
                                    <p className="text-muted">
                                        This button tests if your session is working correctly by calling a protected endpoint.
                                    </p>
                                    <button
                                        className="btn btn-primary mb-3"
                                        onClick={testProtectedEndpoint}
                                        disabled={loading}
                                    >
                                        {loading ? 'Testing...' : 'Test /api/admin/dashboard'}
                                    </button>

                                    {testResult && (
                                        <div className="alert alert-info">
                                            <strong>Test Result:</strong><br />
                                            {testResult}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card">
                                <div className="card-header">
                                    <h6 className="mb-0">Session Info</h6>
                                </div>
                                <div className="card-body">
                                    <ul className="list-unstyled mb-0">
                                        <li><strong>Status:</strong> <span className="badge bg-success">Active</span></li>
                                        <li><strong>Username:</strong> {userInfo?.username || 'Unknown'}</li>
                                        <li><strong>Role:</strong>
                                            <span className={`badge ms-1 ${userInfo?.role === 'ADMIN' ? 'bg-danger' : 'bg-info'}`}>
                                                {userInfo?.role || 'Unknown'}
                                            </span>
                                        </li>
                                        <li><strong>Login:</strong> {formatLoginTime()}</li>
                                        <li><strong>Endpoint:</strong> <code>/api/admin/dashboard</code></li>
                                    </ul>
                                    {userInfo?.role === 'WORKER' && renderPickupPointInfo(userInfo.pickUpPoint)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {renderAdminFeatures()}
                    {renderWorkerFeatures()}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;