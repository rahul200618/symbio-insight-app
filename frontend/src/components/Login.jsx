import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Icons } from './Icons';
import { useAuth } from '../context/AuthContext';

export function Login({ onLoginSuccess, onSwitchToSignup }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false);
    const [localError, setLocalError] = useState('');

    const { login, loading, error: authError } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (!email || !password) {
            setLocalError('Please fill in all fields');
            toast.error('Please fill in all fields');
            return;
        }

        try {
            await login(email, password);
            toast.success('Logged in successfully!');
            if (onLoginSuccess) onLoginSuccess();
        } catch (err) {
            setLocalError(err.message || 'Login failed');
            toast.error(err.message || 'Login failed');
        }
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
                style={{ maxWidth: '400px' }}
            >
                {/* Visual Header */}
                <div className="relative h-28 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 overflow-hidden flex flex-col items-center justify-center text-center p-6">
                    {/* Abstract Shapes in Header */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full blur-2xl transform -translate-x-10 translate-y-10"></div>

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
                        className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg mb-2 ring-1 ring-white/30"
                    >
                        <Icons.DNA className="w-5 h-5 text-white" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h1 className="text-lg font-bold text-white tracking-tight">Welcome Back</h1>
                        <p className="text-[10px] text-purple-100/90 font-medium tracking-widest uppercase mt-0.5">Sign in to Symbio-NLM</p>
                    </motion.div>
                </div>

                {/* Form Content */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                    <Icons.Mail className="w-4 h-4" />
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
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-semibold text-gray-700">Password</label>
                                <button type="button" className="text-[10px] text-purple-600 font-medium hover:underline">
                                    Forgot password?
                                </button>
                            </div>
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

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] text-sm mt-4 relative overflow-hidden"
                            whileHover={loading ? {} : { y: -1 }}
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300"></div>
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Icons.Loader className="w-4 h-4 animate-spin" />
                                    <span>Signing In...</span>
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </motion.button>

                        {/* Footer */}
                        <div className="text-center pt-4 border-t border-gray-100 mt-2">
                            <p className="text-xs text-gray-500">
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    onClick={onSwitchToSignup}
                                    className="text-purple-600 font-bold hover:text-purple-700 transition-colors focus:outline-none"
                                >
                                    Sign up instead
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
