import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import UserLoginForm from './components/UserLoginForm';
import AdminLoginForm from './components/AdminLoginForm';
import MainPage from './pages/MainPage';
import UserRegisterForm from "./components/UserRegisterForm";
import RegistrationSuccessPage from "./pages/RegistrationSuccessPage";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login/user" element={<UserLoginForm />} />
                    <Route path="/register/user" element={<UserRegisterForm />} />
                    <Route path="/login/admin" element={<AdminLoginForm />} />
                    <Route path="/main" element={<MainPage />} />
                    <Route path="/registration-success" element={<RegistrationSuccessPage/>}/>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
