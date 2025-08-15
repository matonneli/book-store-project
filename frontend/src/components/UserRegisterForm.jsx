import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import bookabeLogo from '../assets/images/bookabe-logo.png';

function UserRegisterForm() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contactPhone: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        const validatePassword = (password) => {
            return (
                /[A-Z]/.test(password) && // at least one uppercase
                /[a-z]/.test(password) && // at least one lowercase
                /\d/.test(password) &&    // at least one digit
                password.length >= 8
            );
        };

        if (!formData.firstName || formData.firstName.length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters';
        }
        if (!formData.lastName || formData.lastName.length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters';
        }
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }
        if (!formData.contactPhone || !/^\+?[0-9]{10,15}$/.test(formData.contactPhone)) {
            newErrors.contactPhone = 'Invalid phone number';
        }
        if (!validatePassword(formData.password)) {
            newErrors.password =
                'Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, and one number';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            await axios.post('/api/user/register', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                contactPhone: formData.contactPhone,
                password: formData.password,
            });
            navigate('/registration-success');
        } catch (error) {
            if (error.response) {
                setErrors({ email: error.response.data.message });
            }
        } finally {
            setIsSubmitting(false);
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
                        Create your account
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {[
                            { label: 'First Name', name: 'firstName', type: 'text' },
                            { label: 'Last Name', name: 'lastName', type: 'text' },
                            { label: 'Email', name: 'email', type: 'email' },
                            { label: 'Phone Number', name: 'contactPhone', type: 'tel', placeholder: '+1234567890' },
                            { label: 'Password', name: 'password', type: 'password' },
                            { label: 'Confirm Password', name: 'confirmPassword', type: 'password' },
                        ].map(({ label, name, type, placeholder }) => (
                            <div key={name}>
                                <label htmlFor={name} className="block text-sm font-medium text-[#321d4f] mb-1">
                                    {label}
                                </label>
                                <input
                                    id={name}
                                    name={name}
                                    type={type}
                                    placeholder={placeholder}
                                    onChange={handleChange}
                                    value={formData[name]}
                                    required
                                    className="mt-1 w-full rounded-lg border border-[#e0e0e0] px-4 py-3 shadow-sm focus:border-[#ffbdb1] focus:outline-none focus:ring-1 focus:ring-[#ffbdb1]"
                                />
                                {errors[name] && (
                                    <p className="text-sm text-red-500 mt-1">{errors[name]}</p>
                                )}
                            </div>
                        ))}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-full bg-[#ffbdb1] hover:bg-[#ff9c8b] text-gray-800 font-medium px-6 py-3 transition focus:outline-none focus:ring-2 focus:ring-[#ffbdb1] disabled:opacity-50"
                        >
                            {isSubmitting ? 'Registering...' : 'Register'}
                        </button>
                    </form>

                    <p
                        className="mt-6 text-center text-sm text-[#321d4f]"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        Already have an account?{' '}
                        <Link
                            to="/login/user"
                            className="text-[#ff9c8b] hover:underline font-medium"
                        >
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default UserRegisterForm;
