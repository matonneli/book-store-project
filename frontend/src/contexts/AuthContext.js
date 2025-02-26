import React, { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setAuthToken(token);
        }
    }, []);

    const login = (token) => {
        setAuthToken(token);
        localStorage.setItem('token', token);
    };

    const logout = () => {
        setAuthToken(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ authToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
