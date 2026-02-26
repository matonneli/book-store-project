import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWorkers } from '../contexts/WorkerContext';
import { useReferences } from '../contexts/AdminReferenceContext';
import WorkerModal from '../components/modals/staff/WorkerModal';
import InactivityTimer from '../components/shared/InactivityTimer';
import bookabeLogo from '../assets/images/bookabe-logo.png';

const StaffManagementPage = () => {
    const navigate = useNavigate();
    const { userInfo, logout, updateLastActivity } = useAuth();
    const { workers, loading, fetchWorkers, createWorker, updateWorker, deleteWorker } = useWorkers();
    const { pickUpPoints } = useReferences();

    const [showModal, setShowModal] = useState(false);
    const [editingWorker, setEditingWorker] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPickupPoint, setFilterPickupPoint] = useState('');
    const [sortBy, setSortBy] = useState('username');

    useEffect(() => {
        fetchWorkers();
    }, [fetchWorkers]);

    useEffect(() => {
        if (userInfo && userInfo.role !== 'ADMIN') {
            navigate('/dashboard');
        }
    }, [userInfo, navigate]);

    const filteredWorkers = useMemo(() => {
        let result = [...workers];

        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            result = result.filter(worker =>
                worker.username.toLowerCase().includes(search) ||
                worker.fullName.toLowerCase().includes(search) ||
                worker.email.toLowerCase().includes(search)
            );
        }

        if (filterPickupPoint) {
            const pointId = parseInt(filterPickupPoint);
            result = result.filter(worker =>
                worker.pickUpPoint?.pickupPointId === pointId
            );
        }

        result.sort((a, b) => {
            switch (sortBy) {
                case 'username':   return a.username.localeCompare(b.username);
                case 'fullName':   return a.fullName.localeCompare(b.fullName);
                case 'email':      return a.email.localeCompare(b.email);
                case 'pickupPoint':
                    const aPoint = a.pickUpPoint?.name || 'ZZZ';
                    const bPoint = b.pickUpPoint?.name || 'ZZZ';
                    return aPoint.localeCompare(bPoint);
                default: return 0;
            }
        });

        return result;
    }, [workers, searchTerm, filterPickupPoint, sortBy]);

    const handleAddWorker = () => {
        setEditingWorker(null);
        setShowModal(true);
        updateLastActivity('open add worker modal');
    };

    const handleEditWorker = (worker) => {
        setEditingWorker(worker);
        setShowModal(true);
        updateLastActivity('open edit worker modal');
    };

    const handleDeleteWorker = async (worker) => {
        if (window.confirm(`Are you sure you want to delete worker "${worker.username}"? This action cannot be undone.`)) {
            updateLastActivity('delete worker');
            await deleteWorker(worker.adminId);
        }
    };

    const handleModalSubmit = async (formData) => {
        updateLastActivity('submit worker form');
        let result;
        if (editingWorker) {
            result = await updateWorker(editingWorker.adminId, formData);
        } else {
            result = await createWorker(formData);
        }
        if (result.success) {
            setShowModal(false);
            setEditingWorker(null);
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingWorker(null);
        updateLastActivity('close worker modal');
    };

    if (!userInfo || userInfo.role !== 'ADMIN') {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    Access denied. Only administrators can access this page.
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <InactivityTimer />

            {/* Header */}
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <img
                            src={bookabeLogo}
                            alt="bookabe logo"
                            className="rounded-circle me-3"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                        <h3 className="mb-0">Staff Management</h3>
                    </div>
                    <div>
                        <button
                            className="btn btn-outline-secondary me-2"
                            onClick={() => {
                                window.location.href = '/dashboard';
                                updateLastActivity('navigate to dashboard');
                            }}
                        >
                            ← Back to Dashboard
                        </button>
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
                </div>
            </div>

            {/* Filters and Search */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">Search</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by username, name, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Filter by Pickup Point</label>
                            <select
                                className="form-select"
                                value={filterPickupPoint}
                                onChange={(e) => setFilterPickupPoint(e.target.value)}
                            >
                                <option value="">All Pickup Points</option>
                                {pickUpPoints.map(point => (
                                    <option key={point.pickupPointId} value={point.pickupPointId}>
                                        {point.name}
                                    </option>
                                ))}
                                <option value="none">No Pickup Point</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Sort By</label>
                            <select
                                className="form-select"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="username">Username</option>
                                <option value="fullName">Full Name</option>
                                <option value="email">Email</option>
                                <option value="pickupPoint">Pickup Point</option>
                            </select>
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                            <button className="btn btn-primary w-100" onClick={handleAddWorker}>
                                Add Worker
                            </button>
                        </div>
                    </div>
                    <div className="mt-3">
                        <small className="text-muted">
                            Showing {filteredWorkers.length} of {workers.length} workers
                        </small>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    {loading && workers.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2 text-muted">Loading workers...</p>
                        </div>
                    ) : filteredWorkers.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="text-muted mb-0">
                                {searchTerm || filterPickupPoint
                                    ? 'No workers found matching your filters.'
                                    : 'No workers yet. Click "Add Worker" to create one.'}
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                <tr>
                                    <th>Username</th>
                                    <th>Full Name</th>
                                    <th>Email</th>
                                    <th>Pickup Point</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredWorkers.map(worker => (
                                    <tr key={worker.adminId}>
                                        <td>
                                            <strong>{worker.username}</strong>
                                            <br />
                                            <span className="badge bg-info text-dark">{worker.role}</span>
                                        </td>
                                        <td>{worker.fullName}</td>
                                        <td><small className="text-muted">{worker.email}</small></td>
                                        <td>
                                            {worker.pickUpPoint ? (
                                                <div>
                                                    <strong>{worker.pickUpPoint.name}</strong>
                                                    <br />
                                                    <small className="text-muted">{worker.pickUpPoint.address}</small>
                                                    <br />
                                                    <span className={`badge ${worker.pickUpPoint.isActive ? 'bg-success' : 'bg-danger'}`}>
                                                        {worker.pickUpPoint.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-muted">No pickup point</span>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() => handleEditWorker(worker)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDeleteWorker(worker)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <WorkerModal
                show={showModal}
                onClose={handleModalClose}
                onSubmit={handleModalSubmit}
                editingWorker={editingWorker}
                loading={loading}
            />
        </div>
    );
};

export default StaffManagementPage;