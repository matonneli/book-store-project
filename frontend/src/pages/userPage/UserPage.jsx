import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CartProvider, useCart } from '../../contexts/CartContext';
import { ToastProvider, useToast } from '../../contexts/ToastSystem';
import bookabeLogo from '../../assets/images/bookabe-logo.jpg';
import ProfileTab from './components/ProfileTab';
import ReviewsTab from './components/ReviewsTab';
import OrdersTab from './components/OrdersTab';
import RentalsTab from './components/RentalsTab';
import { FaShoppingCart } from 'react-icons/fa';

const TABS = [
    { id: 'profile', label: 'Profile' },
    { id: 'rentals', label: 'Rentals' },
    { id: 'orders', label: 'Orders' },
    { id: 'reviews', label: 'Reviews' },
];

const CartIcon = () => {
    const { cartCount } = useCart();
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate('/cart')}
            className="relative group cursor-pointer text-[#321d4f]"
            title="Shopping Cart"
        >
            <FaShoppingCart size={22} className="group-hover:text-[#4a2870] transition" />
            {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-5">
                    {cartCount > 99 ? '99+' : cartCount}
                </span>
            )}
        </div>
    );
};

function UserPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const { authToken, user, logout } = useAuth();
    const navigate = useNavigate();
    const { warning } = useToast();

    useEffect(() => {
        console.log('authToken:', authToken);
        console.log('sessionStorage flag:', sessionStorage.getItem('alertsShownUserPage'));
        if (!authToken) return;
        if (sessionStorage.getItem('alertsShownUserPage')) return;

        fetch('/api/notifications/alerts', {
            headers: { Authorization: `Bearer ${authToken}` }
        })
            .then(r => r.json())
            .then(data => {
                console.log('alerts data:', data);
                if (data.hasReadyForPickup) {
                    warning('You have orders ready for pickup! Check your account.');
                }
                if (data.hasOverdueRentals) {
                    warning('You have overdue rentals! Check your account.');
                }
                sessionStorage.setItem('alertsShownUserPage', 'true');
            })
            .catch(() => {});
    }, [authToken, warning]);

    useEffect(() => {
        if (!authToken) {
            navigate('/login/user');
        }
    }, [authToken, navigate]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/logout-success');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const displayName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : 'User';

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileTab />;
            case 'rentals':
                return <RentalsTab />;
            case 'orders':
                return <OrdersTab />;
            case 'reviews':
                return <ReviewsTab />;
            default:
                return null;
        }
    };

    return (
        <CartProvider>
            <ToastProvider>
                <div className="min-h-screen bg-gray-50">
                    <header className="pt-8 px-12 flex justify-between items-center bg-white shadow">
                        <div
                            className="flex items-center gap-4 cursor-pointer"
                            onClick={() => navigate('/')}
                        >
                            <img
                                src={bookabeLogo}
                                alt="bookabe logo"
                                className="w-20 h-20 rounded-full object-cover"
                            />
                            <span
                                className="text-[#321d4f] text-5xl font-light tracking-wider"
                                style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                                bookabe
                            </span>
                        </div>

                        <div className="flex items-center gap-6 text-[#321d4f] text-lg font-medium">
                            {authToken && <CartIcon />}
                            <button
                                onClick={() => navigate('/catalog')}
                                className="hover:underline bg-transparent border-none p-0 cursor-pointer"
                                style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                                Back to Catalog
                            </button>
                            <button
                                onClick={handleLogout}
                                className="bg-[#321d4f] text-white px-4 py-2 rounded-full hover:bg-[#4a2870] transition"
                            >
                                Log out
                            </button>
                        </div>
                    </header>

                    <div className="container mx-auto px-6 mt-8 mb-4">
                        <h1
                            className="text-4xl font-extrabold text-[#321d4f]"
                            style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 300 }}
                        >
                            Welcome, {displayName}!
                        </h1>
                    </div>

                    <div className="container mx-auto px-6 py-4">
                        <nav className="mb-8 border-b border-gray-300">
                            <ul className="flex gap-6 text-lg font-medium text-[#321d4f]">
                                {TABS.map((tab) => (
                                    <li key={tab.id}>
                                        <button
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`pb-2 border-b-4 ${
                                                activeTab === tab.id
                                                    ? 'border-[#ff9c8b] text-[#ff9c8b]'
                                                    : 'border-transparent hover:text-[#ff9c8b]'
                                            } transition-colors`}
                                        >
                                            {tab.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        <section>
                            {renderTabContent()}
                        </section>
                    </div>
                </div>
            </ToastProvider>
        </CartProvider>
    );
}

export default UserPage;