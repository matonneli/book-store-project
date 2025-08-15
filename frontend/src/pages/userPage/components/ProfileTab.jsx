import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import UpdateProfileModal from './UpdateProfileModal';
import UpdatePasswordModal from './UpdatePasswordModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ProfileTab() {
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contactPhone: '',
        createdAt: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const { authToken, user, setUserData: setContextUserData } = useAuth();

    const fetchUserData = useCallback(async () => {
        try {
            const response = await fetch('/api/user/me', {
                method: 'GET',
                headers: { Authorization: `Bearer ${authToken}` },
                cache: 'no-store',
            });

            if (!response.ok) throw new Error('Failed to fetch user data');

            const data = await response.json();

            const fullUserData = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                contactPhone: data.contactPhone || '',
                createdAt: data.createdAt,
            };

            setUserData(fullUserData);

            if (!user || !user.firstName) {
                setContextUserData({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                });
            }
        } catch (err) {
            setError('Failed to load user data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [authToken, user, setContextUserData]);

    useEffect(() => {
        if (authToken) {
            fetchUserData();
        }
    }, [authToken, fetchUserData]);

    const handleUpdateInfo = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleProfileUpdate = (updatedData) => {
        setUserData(prev => ({
            ...prev,
            firstName: updatedData.firstName,
            lastName: updatedData.lastName,
            email: updatedData.email,
            contactPhone: updatedData.contactPhone,
        }));

        setContextUserData({
            firstName: updatedData.firstName,
            lastName: updatedData.lastName,
            email: updatedData.email,
        });

        toast.success('Profile updated successfully!');
    };

    const handleChangePassword = () => {
        setIsPasswordModalOpen(true);
    };

    const handlePasswordChangeSuccess = () => {
        toast.success('Password changed successfully!');
    };

    if (loading) return <p className="p-8 text-center">Loading profile...</p>;
    if (error) return <p className="p-8 text-center text-red-600">{error}</p>;

    return (
        <>
            <div className="bg-white p-8 rounded-lg shadow w-full max-w-4xl mx-auto">
                <h2
                    className="text-3xl font-semibold mb-8 text-center"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                    User Profile
                </h2>

                <div
                    className="grid grid-cols-2 gap-6 mb-8 text-lg"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                    <div>
                        <p>
                            <strong>Name:</strong> {userData.firstName} {userData.lastName}
                        </p>
                    </div>
                    <div>
                        <p>
                            <strong>Email:</strong> {userData.email}
                        </p>
                    </div>
                    <div>
                        <p>
                            <strong>Phone:</strong> {userData.contactPhone || 'Not provided'}
                        </p>
                    </div>
                    <div>
                        <p>
                            <strong>Member since:</strong>{' '}
                            {new Date(userData.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex justify-center gap-6">
                    <button
                        className="px-6 py-2 rounded-full bg-[#321d4f] text-white font-medium hover:bg-[#4a2870] transition"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                        onClick={handleUpdateInfo}
                    >
                        Update Info
                    </button>
                    <button
                        className="px-6 py-2 rounded-full bg-[#ffbdb1] text-gray-800 font-medium hover:bg-[#ff9c8b] transition"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                        onClick={handleChangePassword}
                    >
                        Change Password
                    </button>
                </div>
            </div>

            <UpdateProfileModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                userData={userData}
                onUpdate={handleProfileUpdate}
                authToken={authToken}
            />

            <UpdatePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                authToken={authToken}
                onPasswordChangeSuccess={handlePasswordChangeSuccess}
            />

            <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
        </>
    );
}

export default ProfileTab;
