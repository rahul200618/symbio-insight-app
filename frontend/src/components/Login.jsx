import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Icons } from './Icons';
import { useAuth } from '../context/AuthContext';

export function Login({ onLoginSuccess, onSwitchToSignup }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login, loading, error: authError } = useAuth();
    const [localError, setLocalError] = useState('');

    const [view, setView] = useState('login'); // 'login' | 'forgot'
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        try {
            const result = await login(email, password);
            if (result) {
                if (rememberMe) {
                    localStorage.setItem('symbio_nlm_remember', 'true');
                }
                toast.success('Login successful! Welcome back.');
                onLoginSuccess(result);
            }
        } catch (err) {
            const errorMsg = err.message || 'Login failed. Please try again.';
            setLocalError(errorMsg);
            toast.error(errorMsg);
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setResetLoading(true);
        // Simulate API call
        setTimeout(() => {
            setResetLoading(false);
            toast.success('Password reset link sent to your email!');
            setView('login');
        }, 2000);
    };

    const error = localError || authError;

    return (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50 overflow-hidden font-sans">
            {/* Very subtle ambient light for depth */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.05),transparent_50%)]"></div>

            {/* Main Login Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
                className="relative z-10 w-full bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden m-4"
                style={{ maxWidth: '380px' }}
            >
                {/* Visual Header */}
                <div className="relative h-32 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 overflow-hidden flex flex-col items-center justify-center text-center p-6">
                    {/* Abstract Shapes in Header */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full blur-2xl transform -translate-x-10 translate-y-10"></div>

                    {/* Back Button for Forgot Password View */}
                    {view === 'forgot' && (
                        <button
                            onClick={() => setView('login')}
                            className="absolute left-6 top-6 text-white/80 hover:text-white transition-colors"
                        >
                            <Icons.ArrowLeft className="w-5 h-5" />
                        </button>
                    )}

                    {/* DNA Icon */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{
                            scale: 1,
                            rotate: isInteracting ? 360 : 0
                        }}
                        transition={{
                            type: "spring",
                            duration: isInteracting ? 3 : 0.8,
                            repeat: isInteracting ? Infinity : 0,
                            ease: "linear"
                        }}
                        className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg mb-2 ring-1 ring-white/30"
                    >
                        <Icons.Activity className="w-6 h-6 text-white" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h1 className="text-lg font-bold text-white tracking-tight">Symbio-NLM</h1>
                        <p className="text-[10px] text-purple-100/90 font-medium tracking-widest uppercase mt-0.5">DNA Insight Platform</p>
                    </motion.div>
                </div>

                {/* Content Area */}
                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {view === 'login' ? (
                            <motion.div
                                key="login"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Welcome Back</h2>
                                    <p className="text-sm text-gray-500 mt-1">Please enter your details to sign in</p>
                                </div>

                                <form onSubmit={handleLoginSubmit} className="space-y-4">
                                    {/* Error Message */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                                className="p-3 bg-red-50/80 border border-red-100 rounded-xl flex items-center gap-2 mb-3 text-red-600"
                                            >
                                                <Icons.AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                <p className="text-xs font-medium">{error}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Email Input */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="space-y-1.5"
                                    >
                                        <label className="text-xs font-semibold text-gray-700 ml-1">Email</label>
                                        <div className="flex items-center gap-3 group">
                                            <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 border border-gray-200 transition-all duration-300 group-focus-within:border-purple-500 group-focus-within:text-purple-600 group-focus-within:bg-purple-50 group-focus-within:ring-2 group-focus-within:ring-purple-500/20 group-hover:border-gray-300">
                                                <Icons.User className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                onFocus={() => setIsInteracting(true)}
                                                onBlur={() => setIsInteracting(false)}
                                                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-0 transition-all duration-300 outline-none text-sm text-gray-900 placeholder-gray-400"
                                                placeholder="your@email.com"
                                                required
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Password Input */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="space-y-1.5"
                                    >
                                        <label className="text-xs font-semibold text-gray-700 ml-1">Password</label>
                                        <div className="flex items-center gap-3 group">
                                            <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 border border-gray-200 transition-all duration-300 group-focus-within:border-purple-500 group-focus-within:text-purple-600 group-focus-within:bg-purple-50 group-focus-within:ring-2 group-focus-within:ring-purple-500/20 group-hover:border-gray-300">
                                                <Icons.Lock className="w-4 h-4" />
                                            </div>
                                            <div className="relative flex-1">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    onFocus={() => setIsInteracting(true)}
                                                    onBlur={() => setIsInteracting(false)}
                                                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-0 transition-all duration-300 outline-none text-sm text-gray-900 placeholder-gray-400 pr-11"
                                                    placeholder="••••••••"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                                >
                                                    {showPassword ? (
                                                        <Icons.EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Icons.Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-1">
                                        <label className="flex items-center cursor-pointer group">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={rememberMe}
                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                    className="peer appearance-none opacity-0 absolute h-0 w-0 pointer-events-none"
                                                />
                                                <div className="w-4 h-4 border-2 border-gray-300 rounded peer-checked:bg-purple-600 peer-checked:border-purple-600 transition-all duration-200"></div>
                                                <Icons.Check className="w-2.5 h-2.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
                                            </div>
                                            <span className="ml-2 text-xs text-gray-500 group-hover:text-gray-700 transition-colors">Remember me</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setView('forgot')}
                                            className="text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-all"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>

                                    {/* Submit Button */}
                                    <motion.button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] text-sm mt-2 relative overflow-hidden"
                                        whileHover={loading ? {} : { y: -1 }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300"></div>
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Icons.Loader className="w-4 h-4 animate-spin" />
                                                <span>Signing in...</span>
                                            </span>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </motion.button>

                                    {/* Footer */}
                                    <div className="text-center pt-4 border-t border-gray-100 mt-4">
                                        <p className="text-xs text-gray-500">
                                            Don't have an account?{' '}
                                            <button
                                                type="button"
                                                onClick={onSwitchToSignup}
                                                className="text-purple-600 font-bold hover:text-purple-700 transition-colors focus:outline-none"
                                            >
                                                Sign up free
                                            </button>
                                        </p>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="forgot"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Forgot Password</h2>
                                    <p className="text-sm text-gray-500 mt-1">Enter your email to receive a reset link</p>
                                </div>

                                <form onSubmit={handleForgotSubmit} className="space-y-4">
                                    {/* Email Input */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="space-y-1.5"
                                    >
                                        <label className="text-xs font-semibold text-gray-700 ml-1">Email</label>
                                        <div className="flex items-center gap-3 group">
                                            <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 border border-gray-200 transition-all duration-300 group-focus-within:border-purple-500 group-focus-within:text-purple-600 group-focus-within:bg-purple-50 group-focus-within:ring-2 group-focus-within:ring-purple-500/20 group-hover:border-gray-300">
                                                <Icons.User className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="email"
                                                value={resetEmail}
                                                onChange={(e) => setResetEmail(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-0 transition-all duration-300 outline-none text-sm text-gray-900 placeholder-gray-400"
                                                placeholder="your@email.com"
                                                required
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Submit Button */}
                                    <motion.button
                                        type="submit"
                                        disabled={resetLoading}
                                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] text-sm mt-2 relative overflow-hidden"
                                        whileHover={resetLoading ? {} : { y: -1 }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300"></div>
                                        {resetLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Icons.Loader className="w-4 h-4 animate-spin" />
                                                <span>Sending...</span>
                                            </span>
                                        ) : (
                                            'Send Reset Link'
                                        )}
                                    </motion.button>
                                    <div className="text-center mt-4">
                                        <button
                                            type="button"
                                            onClick={() => setView('login')}
                                            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                                        >
                                            Back to login
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
