import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contactPhone: '',
        password: '',
        confirmPassword: '',
    });

    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.firstName) {
            newErrors.firstName = 'First name is required';
        } else if (formData.firstName.length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters';
        }
        if (!formData.lastName) {
            newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters';
        }
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }
        if (!formData.contactPhone) {
            newErrors.contactPhone = 'Phone number is required';
        } else if (!/^\+?[0-9]{10,15}$/.test(formData.contactPhone)) {
            newErrors.contactPhone = 'Invalid phone number';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirm password is required';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post('http://localhost:8081/api/user/register', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                contactPhone: formData.contactPhone,
                password: formData.password,
            });
            console.log('Registration successful:', response.data);
            navigate('/registration-success');
        } catch (error) {
            if (error.response) {
                setErrors({ email: error.response.data.message });
            } else {
                console.error('Registration failed:', error.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="firstName">First Name</label>
                <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    onChange={handleChange}
                    value={formData.firstName}
                />
                {errors.firstName && <div style={{ color: 'red' }}>{errors.firstName}</div>}
            </div>

            <div>
                <label htmlFor="lastName">Last Name</label>
                <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    onChange={handleChange}
                    value={formData.lastName}
                />
                {errors.lastName && <div style={{ color: 'red' }}>{errors.lastName}</div>}
            </div>

            <div>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    onChange={handleChange}
                    value={formData.email}
                />
                {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}
            </div>

            <div>
                <label htmlFor="contactPhone">Phone Number</label>
                <input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    onChange={handleChange}
                    value={formData.contactPhone}
                    placeholder="+1234567890"
                />
                {errors.contactPhone && (<div style={{ color: 'red' }}>{errors.contactPhone}</div>
                )}
            </div>

            <div>
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    onChange={handleChange}
                    value={formData.password}
                />
                {errors.password && <div style={{ color: 'red' }}>{errors.password}</div>}
            </div>

            <div>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    onChange={handleChange}
                    value={formData.confirmPassword}
                />
                {errors.confirmPassword && (
                    <div style={{ color: 'red' }}>{errors.confirmPassword}</div>
                )}
            </div>

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Register'}
            </button>
        </form>
    );
};

export default RegisterForm;