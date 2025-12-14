import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Icons } from './Icons';
import { useAuth } from '../context/AuthContext';
import { forgotPassword } from '../utils/auth';

export function Login({ onLoginSuccess, onSwitchToSignup }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false);
    const [localError, setLocalError] = useState('');
    
    // Forgot password state
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotSent, setForgotSent] = useState(false);

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
                                <button 
                                    type="button" 
                                    onClick={() => { setShowForgotPassword(true); setForgotEmail(email); }}
                                    className="text-[10px] text-purple-600 font-medium hover:underline"
                                >
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

            {/* Forgot Password Modal */}
            <AnimatePresence>
                {showForgotPassword && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                backdropFilter: 'blur(4px)',
                                zIndex: 9999
                            }}
                            onClick={() => { setShowForgotPassword(false); setForgotSent(false); }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{
                                position: 'fixed',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '100%',
                                maxWidth: '400px',
                                zIndex: 10000,
                                padding: '16px'
                            }}
                        >
                            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                            <Icons.Mail className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Reset Password</h3>
                                            <p className="text-sm text-gray-500">We'll send you reset instructions</p>
                                        </div>
                                    </div>

                                    {forgotSent ? (
                                        <div className="text-center py-4">
                                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                                <Icons.CheckCircle className="w-8 h-8 text-green-600" />
                                            </div>
                                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Check Your Email</h4>
                                            <p className="text-sm text-gray-600 mb-4">
                                                If an account exists with <strong>{forgotEmail}</strong>, you'll receive password reset instructions.
                                            </p>
                                            <button
                                                onClick={() => { setShowForgotPassword(false); setForgotSent(false); }}
                                                style={{ backgroundColor: '#7c3aed', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', fontWeight: '500', border: 'none', cursor: 'pointer' }}
                                            >
                                                Back to Login
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Enter your email address and we'll send you a link to reset your password.
                                            </p>
                                            <input
                                                type="email"
                                                value={forgotEmail}
                                                onChange={(e) => setForgotEmail(e.target.value)}
                                                placeholder="your@email.com"
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-0 transition-all duration-300 outline-none text-sm text-gray-900 placeholder-gray-400 mb-4"
                                            />
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => { setShowForgotPassword(false); setForgotSent(false); }}
                                                    style={{ flex: 1, padding: '10px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (!forgotEmail) {
                                                            toast.error('Please enter your email');
                                                            return;
                                                        }
                                                        setForgotLoading(true);
                                                        try {
                                                            await forgotPassword(forgotEmail);
                                                            setForgotSent(true);
                                                            toast.success('Reset email sent!');
                                                        } catch (err) {
                                                            toast.error(err.message);
                                                        } finally {
                                                            setForgotLoading(false);
                                                        }
                                                    }}
                                                    disabled={forgotLoading}
                                                    style={{ flex: 1, padding: '10px', backgroundColor: '#7c3aed', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: forgotLoading ? 'not-allowed' : 'pointer', opacity: forgotLoading ? 0.7 : 1 }}
                                                >
                                                    {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
