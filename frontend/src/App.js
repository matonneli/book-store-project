import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastSystem';

import HomePage from './pages/HomePage';
import UserLoginForm from './components/UserLoginForm';
import AdminLoginForm from './components/AdminLoginForm';
import ProtectedRoute from './components/ProtectedRoute';
import UserPage from './pages/userPage/UserPage';
import BookDetailPage from './pages/bookDetailPage/BookDetailPage';
import UserRegisterForm from "./components/UserRegisterForm";
import RegistrationSuccessPage from "./pages/RegistrationSuccessPage";
import BookCatalogPage from "./pages/BookCatalogPage";
import ApiTest from "./components/ApiTest";
import LogoutSuccessPage from "./pages/LogoutSuccessPage";
import CartPage from "./pages/CartPage.jsx";
import CheckoutConfirmationPage from "./pages/CheckoutConfirmationPage";
import PaymentMockPage from "./pages/PaymentMockPage";

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <ToastProvider>
                    <Router>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/catalog" element={<BookCatalogPage />} />
                            <Route path="/book/:id" element={<BookDetailPage />} />
                            <Route path="/login/user" element={<UserLoginForm />} />
                            <Route path="/register/user" element={<UserRegisterForm />} />
                            <Route path="/user" element={<ProtectedRoute><UserPage /></ProtectedRoute>} />
                            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                            <Route path="/checkout" element={<ProtectedRoute><CheckoutConfirmationPage /></ProtectedRoute>} />
                            <Route path="/payment-mock" element={<PaymentMockPage />} />
                            <Route path="/registration-success" element={<RegistrationSuccessPage />} />
                            <Route path="/logout-success" element={<LogoutSuccessPage />} />
                            <Route path="/apitest" element={<ApiTest />} />

                        </Routes>
                    </Router>
                </ToastProvider>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
