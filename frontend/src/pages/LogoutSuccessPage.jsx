import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
        <div className="flex min-h-screen items-center justify-center bg-blue-50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
                <h2 className="mb-4 text-center text-2xl font-bold text-blue-700">
                    👋 You have been logged out
                </h2>
                <p className="mb-4 text-center text-gray-700">
                    You will be redirected to the main page in <span className="font-semibold">{countdown}</span> seconds.
                </p>
                <div className="text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Return to Main Page
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LogoutSuccess;
