import React, { useEffect, useState } from "react";
import { useAuth } from '../contexts/AuthContext';

const PaymentMockPage = () => {
    const { authToken } = useAuth();
    const [token, setToken] = useState(null);
    const [totalAmount, setTotalAmount] = useState(null);
    const [error, setError] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const [orderId, setOrderId] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const orderIdFromUrl = urlParams.get('orderId');
        setOrderId(orderIdFromUrl);

        if (authToken) {
            setToken(authToken);
        } else {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                setToken(storedToken);
            } else {
                setError('Authentication token not found');
            }
        }
        if (orderIdFromUrl) {

        } else {
            setError('No order ID provided');
        }
    }, [authToken]);

    useEffect(() => {
        if (token && orderId) {
            fetchOrderAmount(orderId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, orderId]);

    const fetchOrderAmount = async (orderIdParam) => {
        try {
            const response = await fetch(`/api/orders/${orderIdParam}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTotalAmount(data.totalPrice.toFixed(2));
            } else {
                throw new Error('Failed to fetch order details');
            }
        } catch (err) {
            console.error('Error fetching order details:', err);
            setError(err.message);
        }
    };

    const handlePay = async () => {
        setCountdown(5);
        try {
            const authToken = localStorage.getItem('token');
            if (!authToken) throw new Error('Authentication token not found');

            const response = await fetch(`/api/payment/mock?orderId=${orderId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                }
            });

            if (!response.ok) {
                throw new Error('Payment confirmation failed');
            }
            const result = await response.text();
            console.log(result);
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        if (window.opener) {
                            window.opener.postMessage('payment_success', '*');
                        }
                        window.close();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err) {
            console.error(err);
            setError(err.message);
            setCountdown(null);
        }
    };

    const renderContent = () => {
        if (error) {
            return (
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-5xl font-bold mb-6 drop-shadow-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Error
                    </h1>
                    <p className="text-xl md:text-2xl drop-shadow-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {error}
                    </p>
                </div>
            );
        }

        if (totalAmount === null) {
            return (
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-5xl font-bold mb-6 drop-shadow-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Loading...
                    </h1>
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
            );
        }

        return (
            <div className="relative z-10">
                <h1 className="text-3xl md:text-5xl font-bold mb-6 drop-shadow-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Payment Gateway Demo
                </h1>
                <p className="text-xl md:text-2xl drop-shadow-lg mb-8" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Order #{orderId}
                </p>
                <p className="text-2xl md:text-3xl drop-shadow-lg mb-8 font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Amount to pay: {totalAmount} zł
                </p>

                {countdown === null ? (
                    <div className="space-y-4">
                        <p className="text-lg drop-shadow-lg mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            This is a simulated payment system for demonstration purposes
                        </p>
                        <button
                            onClick={handlePay}
                            className="bg-white text-[#321d4f] px-8 py-4 rounded-full hover:bg-gray-100 transition-colors font-bold text-lg shadow-lg"
                            style={{ fontFamily: "'Poppins', sans-serif" }}
                        >
                            💳 Process Payment
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-xl md:text-2xl drop-shadow-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            Processing payment...
                        </p>
                        <p className="text-lg drop-shadow-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            Closing in{" "}
                            <span className="font-bold text-yellow-300 text-2xl">{countdown}</span>{" "}
                            seconds
                        </p>
                        <div className="w-16 h-16 mx-auto">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center text-white text-center px-4 relative overflow-hidden">
            <AnimatedBackground />
            {renderContent()}
        </div>
    );
};

const AnimatedBackground = () => (
    <>
        <div className="absolute inset-0">
            <div className="w-full h-full animate-gradient bg-gradient-to-r from-purple-700 via-pink-500 to-indigo-500 blur-3xl opacity-70"></div>
        </div>

        <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob top-0 left-0"></div>
        <div className="absolute w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 top-1/2 left-1/3"></div>
        <div className="absolute w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 bottom-0 right-0"></div>

        <style jsx>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob {
            animation: blob 8s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 15s ease infinite;
          }
        `}</style>
    </>
);

export default PaymentMockPage;
