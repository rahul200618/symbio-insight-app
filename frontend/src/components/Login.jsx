import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from './Icons';
import { useAuth } from '../context/AuthContext';

export function Login({ onLoginSuccess, onSwitchToSignup }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login, loading, error: authError } = useAuth();
    const [localError, setLocalError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        try {
            const result = await login(email, password);
            if (result) {
                if (rememberMe) {
                    localStorage.setItem('symbio_nlm_remember', 'true');
                }
                onLoginSuccess(result);
            }
        } catch (err) {
            setLocalError(err.message || 'Login failed. Please try again.');
        }
    };

    const error = localError || authError;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-950 relative overflow-hidden">
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
                            <linearGradient id="dnaGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#7A3EF3" />
                                <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                        </defs>
                        {Array.from({ length: 20 }).map((_, i) => (
                            <g key={i}>
                                <circle cx="20" cy={i * 20} r="3" fill="url(#dnaGradient1)" />
                                <circle cx="80" cy={i * 20 + 10} r="3" fill="url(#dnaGradient1)" />
                                <line
                                    x1="20"
                                    y1={i * 20}
                                    x2="80"
                                    y2={i * 20 + 10}
                                    stroke="url(#dnaGradient1)"
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
                                <circle cx="20" cy={i * 20} r="3" fill="url(#dnaGradient1)" />
                                <circle cx="80" cy={i * 20 + 10} r="3" fill="url(#dnaGradient1)" />
                                <line
                                    x1="20"
                                    y1={i * 20}
                                    x2="80"
                                    y2={i * 20 + 10}
                                    stroke="url(#dnaGradient1)"
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

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/50 overflow-hidden">
                    {/* Header with DNA Logo */}
                    <div className="relative bg-gradient-to-br from-purple-500 to-indigo-600 px-8 py-10 text-center">
                        {/* Animated DNA Icon */}
                        <motion.div
                            initial={{ rotate: 0, scale: 1 }}
                            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm"
                        >
                            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
                            className="text-white mb-2 text-3xl font-bold"
                        >
                            Symbio-NLM
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-purple-100 text-sm"
                        >
                            DNA Insight & Analysis Platform
                        </motion.p>
                    </div>

                    {/* Login Form */}
                    <div className="px-8 py-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h2 className="text-gray-900 dark:text-white mb-2 text-center text-2xl font-semibold">Welcome Back</h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-6">
                                Sign in to continue your research
                            </p>
                        </motion.div>

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

                        <form onSubmit={handleSubmit} className="space-y-5">
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
                                        <Icons.User className="w-5 h-5" />
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
                            </motion.div>

                            {/* Remember Me & Forgot Password */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="flex items-center justify-between"
                            >
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                                </label>
                                <button
                                    type="button"
                                    className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors font-medium"
                                >
                                    Forgot password?
                                </button>
                            </motion.div>

                            {/* Submit Button */}
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
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
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span className="relative z-10">Sign In</span>
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

                        {/* Sign Up Link */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400"
                        >
                            Don&apos;t have an account?{' '}
                            <button
                                type="button"
                                onClick={onSwitchToSignup}
                                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors font-medium"
                            >
                                Sign up for free
                            </button>
                        </motion.p>
                    </div>
                </div>

                {/* Footer Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                    className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400"
                >
                    <p>Secure DNA sequence analysis powered by advanced AI</p>
                </motion.div>
            </motion.div>
        </div>
    );
}
