import React, { useState, useEffect } from 'react';

function UpdatePasswordModal({ isOpen, onClose, authToken, onPasswordChangeSuccess }) {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        repeatPassword: '',
    });
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData({
                currentPassword: '',
                newPassword: '',
                repeatPassword: '',
            });
            setError('');
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const validatePassword = (password) => {
        return /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /\d/.test(password) &&
            password.length >= 8;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError('');

        const { currentPassword, newPassword, repeatPassword } = formData;

        if (newPassword !== repeatPassword) {
            setError('New passwords do not match.');
            setUpdating(false);
            return;
        }

        if (!validatePassword(newPassword)) {
            setError('New password must be at least 8 characters long and include one uppercase letter, one lowercase letter, and one number.');
            setUpdating(false);
            return;
        }

        try {
            const response = await fetch('/api/user/changePassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to change password');
            }
            setUpdating(false);
            onPasswordChangeSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
            console.error('Password change error:', err);
            setUpdating(false);
        }
    };

    const handleClose = () => {
        if (!updating) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-4">
                <h3
                    className="text-2xl font-semibold mb-6 text-center"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                    Change Password
                </h3>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                            Current Password
                        </label>
                        <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#321d4f]"
                            disabled={updating}
                        />
                    </div>

                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                            New Password
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#321d4f]"
                            disabled={updating}
                        />
                    </div>

                    <div>
                        <label htmlFor="repeatPassword" className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                            Repeat New Password
                        </label>
                        <input
                            type="password"
                            id="repeatPassword"
                            name="repeatPassword"
                            value={formData.repeatPassword}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#321d4f]"
                            disabled={updating}
                        />
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition disabled:opacity-50"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                            disabled={updating}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#321d4f] text-white rounded-md hover:bg-[#4a2870] transition disabled:opacity-50"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                            disabled={updating}
                        >
                            {updating ? 'Saving...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UpdatePasswordModal;
