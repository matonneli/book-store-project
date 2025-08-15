import React, { useState, useEffect } from 'react';

function UpdateProfileModal({ isOpen, onClose, userData, onUpdate, authToken }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contactPhone: '',
    });
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Initialize form data when modal opens or userData changes
    useEffect(() => {
        if (isOpen && userData) {
            setFormData({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                contactPhone: userData.contactPhone || '',
            });
            setError('');
            setSuccess('');
        }
    }, [isOpen, userData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/user/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }

            const updatedData = await response.json();
            setUpdating(false);
            setSuccess('Profile updated successfully!');

            onUpdate(updatedData);

            onClose();

        } catch (err) {
            setError(err.message);
            console.error('Update error:', err);
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
                    Update Profile
                </h3>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="firstName"
                            className="block text-sm font-medium text-gray-700 mb-1"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                            First Name
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#321d4f]"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                            disabled={updating}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="lastName"
                            className="block text-sm font-medium text-gray-700 mb-1"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                            Last Name
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#321d4f]"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                            disabled={updating}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#321d4f]"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                            disabled={updating}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="contactPhone"
                            className="block text-sm font-medium text-gray-700 mb-1"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            id="contactPhone"
                            name="contactPhone"
                            value={formData.contactPhone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#321d4f]"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
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
                            {updating ? 'Updating...' : 'Update Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UpdateProfileModal;