import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Icons } from './Icons';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword } from '../utils/auth';

export function Signup({ onSignupSuccess, onSwitchToLogin }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const { signup, loading, error: authError } = useAuth();
    const [localError, setLocalError] = useState('');

    const passwordValidation = validatePassword(password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        // Validation
        if (!name.trim()) {
            const error = 'Please enter your name';
            setLocalError(error);
            toast.error(error);
            return;
        }

        if (!validateEmail(email)) {
            const error = 'Please enter a valid email address';
            setLocalError(error);
            toast.error(error);
            return;
        }

        if (!passwordValidation.isValid) {
            const error = 'Password must be at least 8 characters long';
            setLocalError(error);
            toast.error(error);
            return;
        }

        if (password !== confirmPassword) {
            const error = 'Passwords do not match';
            setLocalError(error);
            toast.error(error);
            return;
        }

        if (!agreeToTerms) {
            const error = 'Please agree to the Terms and Conditions';
            setLocalError(error);
            toast.error(error);
            return;
        }

        try {
            const result = await signup(email, password, name);
            if (result) {
                toast.success('Account created successfully! Welcome to Symbio-NLM.');
                onSignupSuccess(result);
            }
        } catch (err) {
            const errorMsg = err.message || 'Registration failed. Please try again.';
            setLocalError(errorMsg);
            toast.error(errorMsg);
        }
    };

    const error = localError || authError;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-950 relative overflow-hidden py-8">
            {/* Animated Background DNA Strands */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* DNA Helix Animation - Left */}
                <motion.div
                    className="absolute left-0 top-0 w-64 h-full opacity-10 dark:opacity-5"
                    initial={{ y: -100 }}
                    animate={{ y: 100 }}
                    transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
                >
                    <svg viewBox="0 0 100 400" className="w-full h-full">
                        <defs>
                            <linearGradient id="dnaGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#7A3EF3" />
                                <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                        </defs>
                        {Array.from({ length: 20 }).map((_, i) => (
                            <g key={i}>
                                <circle cx="20" cy={i * 20} r="3" fill="url(#dnaGradient2)" />
                                <circle cx="80" cy={i * 20 + 10} r="3" fill="url(#dnaGradient2)" />
                                <line
                                    x1="20"
                                    y1={i * 20}
                                    x2="80"
                                    y2={i * 20 + 10}
                                    stroke="url(#dnaGradient2)"
                                    strokeWidth="1"
                                    opacity="0.5"
                                />
                            </g>
                        ))}
                    </svg>
                </motion.div>

                {/* DNA Helix Animation - Right */}
                <motion.div
                    className="absolute right-0 top-0 w-64 h-full opacity-10 dark:opacity-5"
                    initial={{ y: 100 }}
                    animate={{ y: -100 }}
                    transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
                >
                    <svg viewBox="0 0 100 400" className="w-full h-full">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <g key={i}>
                                <circle cx="20" cy={i * 20} r="3" fill="url(#dnaGradient2)" />
                                <circle cx="80" cy={i * 20 + 10} r="3" fill="url(#dnaGradient2)" />
                                <line
                                    x1="20"
                                    y1={i * 20}
                                    x2="80"
                                    y2={i * 20 + 10}
                                    stroke="url(#dnaGradient2)"
                                    strokeWidth="1"
                                    opacity="0.5"
                                />
                            </g>
                        ))}
                    </svg>
                </motion.div>

                {/* Floating Particles */}
                {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-purple-400 dark:bg-purple-600 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            {/* Signup Card */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/50 overflow-hidden">
                    {/* Header with DNA Logo */}
                    <div className="relative bg-gradient-to-br from-purple-500 to-indigo-600 px-8 py-8 text-center">
                        {/* Animated DNA Icon */}
                        <motion.div
                            initial={{ rotate: 0, scale: 1 }}
                            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-3 backdrop-blur-sm"
                        >
                            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <motion.path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 3v18m6-18v18"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-white mb-1 text-2xl font-bold"
                        >
                            Create Account
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-purple-100 text-sm"
                        >
                            Join Symbio-NLM Research Platform
                        </motion.p>
                    </div>

                    {/* Signup Form */}
                    <div className="px-8 py-6">
                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                    className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2"
                                >
                                    <Icons.AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name Field */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Icons.User className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                    />
                                </div>
                            </motion.div>

                            {/* Email Field */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your.email@example.com"
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                    />
                                </div>
                            </motion.div>

                            {/* Password Field */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Icons.Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setPasswordFocused(true)}
                                        onBlur={() => setPasswordFocused(false)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? (
                                            <Icons.EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Icons.Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                <AnimatePresence>
                                    {(passwordFocused || password) && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-2 space-y-1"
                                        >
                                            <div className="flex items-center gap-2 text-xs">
                                                <div className={`w-2 h-2 rounded-full ${passwordValidation.hasMinLength ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                                <span className={passwordValidation.hasMinLength ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                                                    At least 8 characters
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Confirm Password Field */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Icons.Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <Icons.EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Icons.Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </motion.div>

                            {/* Terms and Conditions */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="flex items-start gap-2"
                            >
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={agreeToTerms}
                                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                                    className="w-4 h-4 mt-0.5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                                    I agree to the{' '}
                                    <button type="button" className="text-purple-600 dark:text-purple-400 hover:underline">
                                        Terms and Conditions
                                    </button>
                                    {' '}and{' '}
                                    <button type="button" className="text-purple-600 dark:text-purple-400 hover:underline">
                                        Privacy Policy
                                    </button>
                                </label>
                            </motion.div>

                            {/* Submit Button */}
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                        />
                                        <span>Creating account...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span className="relative z-10">Create Account</span>
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-500"
                                            initial={{ x: '100%' }}
                                            whileHover={{ x: 0 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Sign In Link */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.0 }}
                            className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400"
                        >
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={onSwitchToLogin}
                                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors font-medium"
                            >
                                Sign in
                            </button>
                        </motion.p>
                    </div>
                </div>

                {/* Footer Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400"
                >
                    <p>Secure DNA sequence analysis powered by advanced AI</p>
                </motion.div>
            </motion.div>
        </div>
    );
}
