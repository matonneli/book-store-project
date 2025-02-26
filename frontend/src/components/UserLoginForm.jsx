import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function UserLoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch('http://localhost:8081/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                navigate('/main');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to connect to the server');
        }
    };

    return (
        <div>
            <h2>User Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email:</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <p>
                Not registered yet?{' '}
                <Link to="/register/user" style={{ color: 'blue', textDecoration: 'underline' }}>
                    Click here to register
                </Link>
            </p>
        </div>
    );
}

export default UserLoginForm;
