import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider } from './contexts/AuthContext';
import { BookAdminProvider } from "./contexts/BookAdminContext";
import { AdminReferenceProvider } from "./contexts/AdminReferenceContext";
import { OrderProvider } from "./contexts/OrderContext";
import { WorkerProvider } from "./contexts/WorkerContext";
import { ToastProvider } from "./components/shared/ToastSystem";
import ProtectedRoute from './components/shared/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import TwoFactorPage from './pages/TwoFactorPage';
import DashboardPage from './pages/DashboardPage';
import ManageBooksPage from './pages/ManageBooksPage';
import ManageOrdersPage from "./pages/ManageOrdersPage";
import StaffManagementPage from "./pages/StaffManagementPage";
import AnalyticsPage from "./pages/AnalyticsPage";


function App() {
    return (
        <Router>
            <AuthProvider>
                <AdminReferenceProvider>
                    <ToastProvider>
                        <WorkerProvider>
                            <BookAdminProvider>
                                <OrderProvider>
                                    <div className="min-vh-100 bg-light">
                                        <Routes>
                                            <Route path="/" element={<Navigate to="/login" replace />} />

                                            <Route path="/login" element={<LoginPage />} />
                                            <Route path="/2fa" element={<TwoFactorPage />} />

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

                                            <Route
                                                path="/staff-management"
                                                element={
                                                    <ProtectedRoute>
                                                        <StaffManagementPage />
                                                    </ProtectedRoute>
                                                }
                                            />

                                            <Route
                                                path="/analytics"
                                                element={
                                                    <ProtectedRoute>
                                                        <AnalyticsPage />
                                                    </ProtectedRoute>
                                                }
                                            />

                                            <Route path="*" element={<Navigate to="/login" replace />} />
                                        </Routes>
                                    </div>
                                </OrderProvider>
                            </BookAdminProvider>
                        </WorkerProvider>
                    </ToastProvider>
                </AdminReferenceProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;