import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);
    const [lastActivityTime, setLastActivityTime] = useState(Date.now());
    const navigate = useNavigate();
    const location = useLocation();

    const fetchAdminProfile = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/admin/profile', {
                credentials: 'include',
            });

            if (response.ok) {
                const profile = await response.json();
                setUserInfo(profile);
                return true;
            } else {
                setUserInfo(null);
                return false;
            }
        } catch (err) {
            console.error('Failed to fetch admin profile:', err);
            setUserInfo(null);
            return false;
        }
    };

    const checkAuthStatus = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8081/api/admin/auth-status', {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setIsAuthenticated(data.authenticated);

                if (data.authenticated) {
                    await fetchAdminProfile();
                } else {
                    setUserInfo(null);
                }
            } else {
                setIsAuthenticated(false);
                setUserInfo(null);
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            setIsAuthenticated(false);
            setUserInfo(null);
        } finally {
            setIsLoading(false);
        }
    };

    const updateLastActivity = (source = 'unknown') => {
        const now = Date.now();
        setLastActivityTime(now);
        sessionStorage.setItem('lastActivityTime', now.toString());
    };

    const logout = async () => {
        try {
            await fetch('http://localhost:8081/api/admin/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (err) {
            console.warn('Logout request failed, but continuing...', err);
        } finally {
            sessionStorage.removeItem('lastActivityTime');
            sessionStorage.removeItem('adminLoginTime');
            setIsAuthenticated(false);
            setUserInfo(null);
            setLastActivityTime(Date.now());
            navigate('/login');
        }
    };

    const getRemainingTime = () => {
        const elapsed = Date.now() - lastActivityTime;
        return Math.max(0, 60 * 60 * 1000 - elapsed);
    };

    useEffect(() => {
        const storedTime = sessionStorage.getItem('lastActivityTime');
        if (storedTime) {
            setLastActivityTime(parseInt(storedTime));
        }

        checkAuthStatus();
        updateLastActivity(`navigation to ${location.pathname}`);
        const interval = setInterval(() => {
            const remaining = getRemainingTime();
            if (remaining <= 0 && isAuthenticated) {
                console.log('User idle for 60 minutes, logging out');
                logout();
            }
        }, 1000);

        const handleStorageChange = (event) => {
            if (event.key === 'lastActivityTime' && event.newValue) {
                setLastActivityTime(parseInt(event.newValue));
                console.log(`lastActivityTime updated from storage: ${new Date(parseInt(event.newValue)).toISOString()}`);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [location.pathname]);

    const value = {
        isAuthenticated,
        isLoading,
        userInfo,
        logout,
        checkAuthStatus,
        lastActivityTime,
        getRemainingTime,
        updateLastActivity,
        fetchAdminProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};