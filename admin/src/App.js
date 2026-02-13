import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider } from './contexts/AuthContext';
import { BookAdminProvider } from "./contexts/BookAdminContext";
import { AdminReferenceProvider } from "./contexts/AdminReferenceContext";
import { OrderProvider } from "./contexts/OrderContext";
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import TwoFactorPage from './pages/TwoFactorPage';
import DashboardPage from './pages/DashboardPage';
import ManageBooksPage from './pages/ManageBooksPage';
import ManageOrdersPage from "./pages/ManageOrdersPage";


function App() {
    return (
        <Router>
            <AuthProvider>
                <AdminReferenceProvider>
                    <BookAdminProvider>
                        <OrderProvider>
                            <div className="min-vh-100 bg-light">
                                <Routes>
                                    <Route path="/" element={<Navigate to="/login" replace />} />

                                    {/* Auth routes */}
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/2fa" element={<TwoFactorPage />} />

                                    {/* Protected admin routes */}
                                    <Route
                                        path="/dashboard"
                                        element={
                                            <ProtectedRoute>
                                                <DashboardPage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/manage-books"
                                        element={
                                            <ProtectedRoute>
                                                <ManageBooksPage />
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="/manage-orders"
                                        element={
                                            <ProtectedRoute>
                                                <ManageOrdersPage />
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route path="*" element={<Navigate to="/login" replace />} />
                                </Routes>
                            </div>
                        </OrderProvider>
                    </BookAdminProvider>
                </AdminReferenceProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;