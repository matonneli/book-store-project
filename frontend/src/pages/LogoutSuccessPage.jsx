import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bookabeLogo from '../assets/images/bookabe-logo.png';

function LogoutSuccess() {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        const redirectTimer = setTimeout(() => {
            navigate('/');
        }, 5000);

        return () => {
            clearInterval(timer);
            clearTimeout(redirectTimer);
        };
    }, [navigate]);

    return (
        <div
            className="relative min-h-screen bg-white px-4 flex flex-col"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
            {/* Логотип слева сверху */}
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

            {/* Название по центру сверху */}
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

            {/* Центр страницы */}
            <div className="flex-grow flex items-center justify-center pb-12">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md border border-[#f0f0f0]">
                    <h2
                        className="mb-4 text-center text-2xl font-light text-[#321d4f]"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                        👋 You have been logged out
                    </h2>
                    <p className="mb-4 text-center text-[#4a4a4a]">
                        You will be redirected to the main page in{' '}
                        <span className="font-semibold text-[#321d4f]">{countdown}</span> seconds.
                    </p>
                    <div className="text-center">
                        <button
                            onClick={() => navigate('/')}
                            className="mt-4 inline-block rounded-full bg-[#ffbdb1] hover:bg-[#ff9c8b] text-black font-medium px-6 py-3 transition focus:outline-none focus:ring-2 focus:ring-[#ffbdb1]"
                        >
                            Return to Main Page
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LogoutSuccess;
