import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token) {
            setAuthToken(token);
        }

        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (err) {
                console.error('Failed to parse user data:', err);
                localStorage.removeItem('user');
            }
        }
    }, []);

    const login = (token, userData = null) => {
        setAuthToken(token);
        localStorage.setItem('token', token);

        if (userData) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        }
    };

    const setUserData = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = async () => {
        const token = localStorage.getItem('token');
        try {
            if (token) {
                await fetch('/api/user/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (err) {
            console.error('Logout request failed:', err);
        } finally {
            setAuthToken(null);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    };

    return (
        <AuthContext.Provider value={{
            authToken,
            user,
            login,
            logout,
            setUserData
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};