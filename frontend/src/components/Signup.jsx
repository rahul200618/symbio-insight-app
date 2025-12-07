import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Icons } from './Icons';
import { useAuth } from '../context/AuthContext';

export function Signup({ onSignupSuccess, onSwitchToLogin }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [particles, setParticles] = useState([]);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

    const { signup, loading, error: authError } = useAuth();
    const [localError, setLocalError] = useState('');

    // Generate floating particles
    useEffect(() => {
        const newParticles = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 5
        }));
        setParticles(newParticles);
    }, []);

    // Password strength calculator
    useEffect(() => {
        if (!password) {
            setPasswordStrength({ score: 0, label: '', color: '' });
            return;
        }

        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;

        const strengths = [
            { score: 0, label: 'Too weak', color: 'bg-red-500' },
            { score: 1, label: 'Weak', color: 'bg-orange-500' },
            { score: 2, label: 'Fair', color: 'bg-yellow-500' },
            { score: 3, label: 'Good', color: 'bg-lime-500' },
            { score: 4, label: 'Strong', color: 'bg-green-500' },
            { score: 5, label: 'Very Strong', color: 'bg-emerald-500' },
        ];

        setPasswordStrength(strengths[Math.min(score, 5)]);
    }, [password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (password !== confirmPassword) {
            setLocalError('Passwords do not match');
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setLocalError('Password must be at least 6 characters');
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            const result = await signup(email, password, name);
            if (result) {
                toast.success('Account created successfully! Welcome to Symbio-NLM.');
                onSignupSuccess(result);
            }
        } catch (err) {
            const errorMsg = err.message || 'Signup failed. Please try again.';
            setLocalError(errorMsg);
            toast.error(errorMsg);
        }
    };

    const error = localError || authError;

    return (
        <div className="h-screen w-full flex items-center justify-center relative overflow-hidden">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-700">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNGgydjJoLTJ2LTJ6bS0yIDJoLTJ2Mmgydi0yem0wLTJoMnYyaC0ydi0yem0tMiAyaC0ydjJoMnYtMnptLTQgMGgybC0yIDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
            </div>

            {/* Floating Particles */}
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-white"
                    style={{
                        width: particle.size,
                        height: particle.size,
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        delay: particle.delay,
                        ease: "easeInOut"
                    }}
                />
            ))}

            {/* DNA Helix Decoration */}
            <motion.div
                className="absolute right-10 bottom-1/4 opacity-10"
                animate={{ rotate: -360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
                <svg width="200" height="200" viewBox="0 0 200 200">
                    <path d="M50 20 Q30 60, 50 100 Q70 140, 50 180" stroke="white" strokeWidth="3" fill="none" opacity="0.5" />
                    <path d="M150 20 Q170 60, 150 100 Q130 140, 150 180" stroke="white" strokeWidth="3" fill="none" opacity="0.5" />
                </svg>
            </motion.div>

            {/* Main Signup Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-sm px-4"
            >
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-indigo-200/50 dark:border-indigo-700/50"
                >
                    {/* Header with 3D Effect */}
                    <div className="relative p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white overflow-hidden">
                        <motion.div
                            animate={{
                                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                            }}
                            transition={{ duration: 10, repeat: Infinity }}
                            className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-50"
                            style={{ backgroundSize: '200% 200%' }}
                        />

                        <motion.div
                            className="relative z-10 text-center"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {/* Animated DNA Logo */}
                            <motion.div
                                className="w-16 h-16 mx-auto mb-3 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
                                whileHover={{ rotate: 360, scale: 1.15 }}
                                transition={{ duration: 0.6 }}
                            >
                                <svg width="40" height="40" viewBox="0 0 40 40">
                                    <path d="M12 4 Q8 12, 12 20 Q16 28, 12 36" stroke="white" strokeWidth="2.5" fill="none" />
                                    <path d="M28 4 Q32 12, 28 20 Q24 28, 28 36" stroke="white" strokeWidth="2.5" fill="none" />
                                    <line x1="12" y1="10" x2="28" y2="10" stroke="white" strokeWidth="1.5" />
                                    <line x1="12" y1="20" x2="28" y2="20" stroke="white" strokeWidth="1.5" />
                                    <line x1="12" y1="30" x2="28" y2="30" stroke="white" strokeWidth="1.5" />
                                </svg>
                            </motion.div>

                            <h2 className="text-2xl font-bold mb-1">Create Account</h2>
                            <p className="text-sm text-indigo-100">Join Symbio-NLM Today</p>
                        </motion.div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    className="p-4 bg-red-50 dark:bg-red-900/40 border-2 border-red-300 dark:border-red-700 rounded-lg flex items-start gap-3 shadow-lg"
                                >
                                    <Icons.AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm font-semibold text-red-700 dark:text-red-200">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Name Input */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Full Name
                            </label>
                            <motion.div
                                className="relative"
                                whileHover={{ scale: 1.01 }}
                            >
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                    <Icons.User className="w-4 h-4 text-gray-400" />
                                </div>
                                <motion.input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/20 dark:focus:border-indigo-400 transition-all outline-none text-sm text-gray-900 dark:text-white"
                                    placeholder="John Doe"
                                    required
                                    autoFocus
                                    aria-label="Full name"
                                    whileFocus={{ scale: 1.01 }}
                                />
                            </motion.div>
                        </motion.div>

                        {/* Email Input */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Email Address
                            </label>
                            <motion.div
                                className="relative"
                                whileHover={{ scale: 1.01 }}
                            >
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                    <Icons.User className="w-4 h-4 text-gray-400" />
                                </div>
                                <motion.input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/20 dark:focus:border-indigo-400 transition-all outline-none text-sm text-gray-900 dark:text-white"
                                    placeholder="your.email@example.com"
                                    required
                                    aria-label="Email address"
                                    whileFocus={{ scale: 1.01 }}
                                />
                            </motion.div>
                        </motion.div>

                        {/* Password Input */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Password
                            </label>
                            <motion.div
                                className="relative"
                                whileHover={{ scale: 1.01 }}
                            >
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                    <Icons.Lock className="w-4 h-4 text-gray-400" />
                                </div>
                                <motion.input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-11 py-2.5 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/20 dark:focus:border-indigo-400 transition-all outline-none text-sm text-gray-900 dark:text-white"
                                    placeholder="••••••••"
                                    required
                                    aria-label="Password"
                                    minLength={6}
                                    whileFocus={{ scale: 1.01 }}
                                />
                                <motion.button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900 dark:hover:text-indigo-300 transition-all shadow-sm"
                                    whileHover={{ scale: 1.15 }}
                                    whileTap={{ scale: 0.95 }}
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <Icons.EyeOff className="w-4 h-4" /> : <Icons.Eye className="w-4 h-4" />}
                                </motion.button>
                            </motion.div>
                            {/* Password Strength Indicator */}
                            {password && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-2 space-y-1"
                                >
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                                    level <= passwordStrength.score
                                                        ? passwordStrength.color
                                                        : 'bg-gray-200 dark:bg-gray-700'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <p className={`text-xs font-medium ${
                                        passwordStrength.score <= 1 ? 'text-red-600 dark:text-red-400' :
                                        passwordStrength.score <= 2 ? 'text-yellow-600 dark:text-yellow-400' :
                                        'text-green-600 dark:text-green-400'
                                    }`}>
                                        {passwordStrength.label}
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Confirm Password Input */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Confirm Password
                            </label>
                            <motion.div
                                className="relative"
                                whileHover={{ scale: 1.01 }}
                            >
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                    <Icons.Lock className="w-4 h-4 text-gray-400" />
                                </div>
                                <motion.input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/20 dark:focus:border-indigo-400 transition-all outline-none text-sm text-gray-900 dark:text-white"
                                    placeholder="••••••••"
                                    required
                                    aria-label="Confirm password"
                                    whileFocus={{ scale: 1.01 }}
                                />
                            </motion.div>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-bold text-base shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden"
                            whileHover={{ scale: loading ? 1 : 1.02, y: -2 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            aria-label={loading ? 'Creating account...' : 'Create account'}
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                                animate={{ x: loading ? ['-100%', '200%'] : ['-100%', '200%'] }}
                                transition={{ duration: loading ? 1.5 : 2, repeat: Infinity, ease: 'linear' }}
                            />
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        >
                                            <Icons.Loader className="w-5 h-5" />
                                        </motion.div>
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            Creating account...
                                        </motion.span>
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </span>
                        </motion.button>

                        {/* Login Link */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-center"
                        >
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                Already have an account?{' '}
                                <motion.button
                                    type="button"
                                    onClick={onSwitchToLogin}
                                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors underline decoration-2 underline-offset-2"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Sign in instead
                                </motion.button>
                            </p>
                        </motion.div>
                    </form>
                </motion.div>
            </motion.div>

            {/* Footer */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="absolute bottom-6 left-0 right-0 text-center text-base font-bold text-white drop-shadow-lg z-20"
            >
                © 2024 Symbio-NLM. Secure DNA Analysis Platform.
            </motion.p>
        </div>
    );
}
