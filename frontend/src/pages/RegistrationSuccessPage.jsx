import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RegistrationSuccess() {
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
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Registration Successful!</h2>
            <p>You will be redirected to the main page in {countdown} seconds.</p>
            <p>
                <a
                    href="/"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('/');
                    }}
                    style={{ color: 'blue', textDecoration: 'underline' }}
                >
                    Return to Main Page
                </a>
            </p>
        </div>
    );
}
export default RegistrationSuccess;