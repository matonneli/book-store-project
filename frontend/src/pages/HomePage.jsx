import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Select Login Role</h1>
            <button onClick={() => navigate('/login/user')}>Login as User</button>
            <button onClick={() => navigate('/login/admin')}>Login as Admin</button>
        </div>
    );
}

export default HomePage;
