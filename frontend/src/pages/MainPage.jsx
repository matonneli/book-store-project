import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function MainPage() {
    const [userData, setUserData] = useState({ firstName: '', lastName: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { authToken, logout } = useAuth();
    const navigate = useNavigate();

    const fetchUserData = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/user/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const data = await response.json();
            setUserData({
                firstName: data.firstName,
                lastName: data.lastName,
            });
        } catch (err) {
            setError('Failed to load user data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authToken) {
            navigate('/login/user');
        } else {
            const loadData = async () => {
                try {
                    await fetchUserData();
                } catch (err) {
                    console.error('Failed to fetch user data:', err);
                }
            };

            loadData();
        }
    }, [authToken, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login/user');
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div>
            <h2>Main Page - Welcome!</h2>
            <p>
                You are logged in as: <strong>{userData.firstName} {userData.lastName}</strong>
            </p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default MainPage;