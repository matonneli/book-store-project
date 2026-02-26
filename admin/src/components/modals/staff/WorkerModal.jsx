import React, { useState, useEffect } from 'react';
import { useReferences } from '../../../contexts/AdminReferenceContext';

const WorkerModal = ({ show, onClose, onSubmit, editingWorker, loading }) => {
    const { pickUpPoints } = useReferences();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        email: '',
        pickupPointId: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (editingWorker) {
            setFormData({
                username: editingWorker.username || '',
                password: '', // Always empty for editing
                fullName: editingWorker.fullName || '',
                email: editingWorker.email || '',
                pickupPointId: editingWorker.pickUpPoint?.pickupPointId || '',
            });
        } else {
            setFormData({
                username: '',
                password: '',
                fullName: '',
                email: '',
                pickupPointId: '',
            });
        }
        setErrors({});
    }, [editingWorker, show]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (!/^[a-z]+$/.test(formData.username)) {
            newErrors.username = 'Username can only contain lowercase letters';
        } else if (formData.username.length < 3 || formData.username.length > 50) {
            newErrors.username = 'Username must be between 3 and 50 characters';
        }

        if (!editingWorker && !formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const submitData = { ...formData };

            submitData.pickupPointId = formData.pickupPointId
                ? parseInt(formData.pickupPointId)
                : null;

            if (editingWorker && !submitData.password) {
                delete submitData.password;
            }

            onSubmit(submitData);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {editingWorker ? '✏️ Edit Worker' : '➕ Add New Worker'}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            disabled={loading}
                        />
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {/* Username */}
                            <div className="mb-3">
                                <label className="form-label">
                                    Username <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="e.g., johndoe"
                                    disabled={loading}
                                />
                                {errors.username && (
                                    <div className="invalid-feedback">{errors.username}</div>
                                )}
                                <small className="text-muted">Only lowercase letters (a-z)</small>
                            </div>

                            {/* Password */}
                            <div className="mb-3">
                                <label className="form-label">
                                    Password {!editingWorker && <span className="text-danger">*</span>}
                                </label>
                                <input
                                    type="password"
                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder={editingWorker ? 'Leave empty to keep current password' : 'Enter password'}
                                    disabled={loading}
                                />
                                {errors.password && (
                                    <div className="invalid-feedback">{errors.password}</div>
                                )}
                                <small className="text-muted">
                                    {editingWorker
                                        ? 'Leave empty to keep current password'
                                        : 'Minimum 6 characters'}
                                </small>
                            </div>

                            {/* Full Name */}
                            <div className="mb-3">
                                <label className="form-label">
                                    Full Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="e.g., John Doe"
                                    disabled={loading}
                                />
                                {errors.fullName && (
                                    <div className="invalid-feedback">{errors.fullName}</div>
                                )}
                            </div>

                            {/* Email */}
                            <div className="mb-3">
                                <label className="form-label">
                                    Email <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="e.g., john.doe@example.com"
                                    disabled={loading}
                                />
                                {errors.email && (
                                    <div className="invalid-feedback">{errors.email}</div>
                                )}
                            </div>

                            {/* Pickup Point */}
                            <div className="mb-3">
                                <label className="form-label">Pickup Point</label>
                                <select
                                    className="form-select"
                                    name="pickupPointId"
                                    value={formData.pickupPointId}
                                    onChange={handleChange}
                                    disabled={loading}
                                >
                                    <option value="">-- No Pickup Point --</option>
                                    {pickUpPoints.map(point => (
                                        <option key={point.pickupPointId} value={point.pickupPointId}>
                                            {point.name} - {point.address}
                                        </option>
                                    ))}
                                </select>
                                <small className="text-muted">Optional - assign worker to a pickup point</small>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        {editingWorker ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    editingWorker ? 'Update Worker' : 'Create Worker'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WorkerModal;