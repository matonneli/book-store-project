import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import bookabeLogo from '../assets/images/bookabe-logo.jpg';
import manPic from '../assets/images/man2.jpg';

function HomePage() {
    const navigate = useNavigate();
    const { authToken, logout } = useAuth();

    return (
        <div className="h-screen flex" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <div className="w-[70%] bg-white flex">
                <div className="w-[65%] flex flex-col px-12">
                    <header className="pt-8">
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
                                className="text-[#321d4f] text-5xl"
                                style={{
                                    fontFamily: "'Poppins', sans-serif",
                                    fontWeight: 300,
                                    letterSpacing: '2px'
                                }}
                            >
                bookabe
              </span>
                        </div>
                    </header>

                    <div className="flex-1 flex flex-col justify-center">
                        <h1 className="text-6xl font-light text-black leading-snug">
                            Keep the{' '}
                            <span className="relative inline-flex items-center justify-center w-14 h-14 mx-1">
                <span className="absolute w-full h-full bg-[#ffbdb1] rounded-full"></span>
                <span className="relative z-10 -rotate-12">B</span>
              </span>
                            ooks you love,
                            <br />
                            borrow the ones you crave.
                            <br />
                            Dive in!
                        </h1>

                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={() => navigate('/catalog')}
                                className="w-[80%] bg-[#ffbdb1] hover:bg-[#ff9c8b] text-gray-800 font-medium py-4 rounded-full transition"
                            >
                                Explore
                            </button>
                        </div>
                    </div>
                </div>

                <div className="w-[35%] flex items-center p-8">
                    <img
                        src={manPic}
                        alt="Featured book"
                        className="w-full h-auto max-h-[80vh] object-contain"
                    />
                </div>
            </div>

            <div className="w-[30%] bg-[#321d4f] relative flex items-center justify-center">
                <nav className="absolute top-6 right-8 flex space-x-6">
                    {authToken ? (
                        <>
                            <button
                                onClick={() => navigate('/user')}
                                className="text-white text-lg font-medium hover:underline px-6 py-2"
                            >
                                My Account
                            </button>
                            <button
                                onClick={() => {
                                    logout();
                                    navigate('/logout-success');
                                }}
                                className="bg-[#241736] hover:bg-[#1b1129] text-white text-lg font-semibold px-6 py-3 rounded-full transition"
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate('/login/user')}
                                className="text-white text-lg font-medium hover:underline px-6 py-2"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => navigate('/register/user')}
                                className="bg-[#241736] hover:bg-[#1b1129] text-white text-lg font-semibold px-6 py-3 rounded-full transition"
                            >
                                Create Account
                            </button>
                        </>
                    )}
                </nav>
            </div>
        </div>
    );
}

export default HomePage;