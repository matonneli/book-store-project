import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import bookabeLogo from '../assets/images/bookabe-logo.png';

function UserLoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch('/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                login(data.token);
                navigate('/catalog');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to connect to the server');
        }
    };

    return (
        <div
            className="relative min-h-screen bg-white px-4 flex flex-col"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
            <div
                className="absolute top-6 left-6 cursor-pointer"
                onClick={() => navigate('/')}
            >
                <img
                    src={bookabeLogo}
                    alt="bookabe logo"
                    className="w-20 h-20 rounded-full object-cover"
                />
            </div>

            <div className="pt-24 pb-2 text-center flex-shrink-0">
                <span
                    className="text-[#321d4f] text-5xl"
                    style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 300,
                        letterSpacing: '1.5px'
                    }}
                >
                    bookabe
                </span>
            </div>

            <div className="flex-grow flex items-center justify-center pb-12">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-[#f0f0f0]">
                    <h2
                        className="mb-6 text-center text-2xl font-light text-[#321d4f]"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                        Welcome back
                    </h2>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[#321d4f] mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 w-full rounded-lg border border-[#e0e0e0] px-4 py-3 shadow-sm focus:border-[#ffbdb1] focus:outline-none focus:ring-1 focus:ring-[#ffbdb1]"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[#321d4f] mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 w-full rounded-lg border border-[#e0e0e0] px-4 py-3 shadow-sm focus:border-[#ffbdb1] focus:outline-none focus:ring-1 focus:ring-[#ffbdb1]"
                            />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <button
                            type="submit"
                            className="w-full rounded-full bg-[#ffbdb1] hover:bg-[#ff9c8b] text-black font-medium px-6 py-3 transition focus:outline-none focus:ring-2 focus:ring-[#ffbdb1]"
                        >
                            Login
                        </button>
                    </form>
                    <p
                        className="mt-6 text-center text-sm text-[#321d4f]"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        Not registered yet?{' '}
                        <Link
                            to="/register/user"
                            className="text-[#ff9c8b] hover:underline font-medium"
                        >
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default UserLoginForm;