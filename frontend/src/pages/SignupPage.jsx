import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Signup } from '../components/Signup';

export function SignupPage() {
    const navigate = useNavigate();

    const handleSignupSuccess = () => {
        // After successful signup, go to dashboard
        navigate('/dashboard', { replace: true });
    };

    const handleSwitchToLogin = () => {
        navigate('/login');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <Signup
                onSignupSuccess={handleSignupSuccess}
                onSwitchToLogin={handleSwitchToLogin}
            />
        </motion.div>
    );
}
