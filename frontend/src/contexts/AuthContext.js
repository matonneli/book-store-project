import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // true until token validated

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/user/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const userData = await response.json();
                    setAuthToken(token);
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            } catch (err) {
                console.error('Token validation failed:', err);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
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
                    headers: { 'Authorization': `Bearer ${token}` }
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
            isLoading,
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