import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Login } from '../components/Login';

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLoginSuccess = () => {
        // Redirect to the page user tried to access, or dashboard
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
    };

    const handleSwitchToSignup = () => {
        navigate('/signup');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <Login
                onLoginSuccess={handleLoginSuccess}
                onSwitchToSignup={handleSwitchToSignup}
            />
        </motion.div>
    );
}
