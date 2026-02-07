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
                            <label htmlFor="login-email" className="text-xs font-semibold text-gray-700 ml-1">Email</label>
                            <div className="flex items-center gap-3 group">
                                <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 border border-gray-200 transition-all duration-300 group-focus-within:border-purple-500 group-focus-within:text-purple-600 group-focus-within:bg-purple-50 group-focus-within:ring-2 group-focus-within:ring-purple-500/20 group-hover:border-gray-300" aria-hidden="true">
                                    <Icons.Mail className="w-4 h-4" />
                                </div>
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setIsInteracting(true)}
                                    onBlur={() => setIsInteracting(false)}
                                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 outline-none text-sm text-gray-900 placeholder-gray-400"
                                    placeholder="your@email.com"
                                    required
                                    autoComplete="email"
                                    aria-required="true"
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
                                <label htmlFor="login-password" className="text-xs font-semibold text-gray-700">Password</label>
                                <button 
                                    type="button" 
                                    onClick={() => { setShowForgotPassword(true); setForgotEmail(email); }}
                                    className="text-[10px] text-purple-600 font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1 rounded"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="flex items-center gap-3 group">
                                <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 border border-gray-200 transition-all duration-300 group-focus-within:border-purple-500 group-focus-within:text-purple-600 group-focus-within:bg-purple-50 group-focus-within:ring-2 group-focus-within:ring-purple-500/20 group-hover:border-gray-300" aria-hidden="true">
                                    <Icons.Lock className="w-4 h-4" />
                                </div>
                                <div className="relative flex-1">
                                    <input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setIsInteracting(true)}
                                        onBlur={() => setIsInteracting(false)}
                                        className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 outline-none text-sm text-gray-900 placeholder-gray-400 pr-11"
                                        placeholder="••••••••"
                                        required
                                        autoComplete="current-password"
                                        aria-required="true"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        aria-pressed={showPassword}
                                    >
                                        {showPassword ? (
                                            <Icons.EyeOff className="w-4 h-4" aria-hidden="true" />
                                        ) : (
                                            <Icons.Eye className="w-4 h-4" aria-hidden="true" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] text-sm mt-4 relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                            whileHover={loading ? {} : { y: -1 }}
                            aria-busy={loading}
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300" aria-hidden="true"></div>
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Icons.Loader className="w-4 h-4 animate-spin" aria-hidden="true" />
                                    <span>Signing In...</span>
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </motion.button>

                        {/* OAuth Divider */}
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        {/* OAuth Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        const { signInWithGoogle } = await import('../utils/oauthService');
                                        const result = await signInWithGoogle();
                                        if (result.token) {
                                            localStorage.setItem('symbio_token', result.token);
                                            localStorage.setItem('symbio_user', JSON.stringify(result.user));
                                            toast.success(`Welcome${result.isNewUser ? '' : ' back'}, ${result.user.name}!`);
                                            if (onLoginSuccess) onLoginSuccess();
                                        }
                                    } catch (err) {
                                        toast.error(err.message || 'Google sign-in failed');
                                    }
                                }}
                                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium text-gray-700"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Google
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        const { signInWithGithub } = await import('../utils/oauthService');
                                        const result = await signInWithGithub();
                                        if (result.token) {
                                            localStorage.setItem('symbio_token', result.token);
                                            localStorage.setItem('symbio_user', JSON.stringify(result.user));
                                            toast.success(`Welcome${result.isNewUser ? '' : ' back'}, ${result.user.name}!`);
                                            if (onLoginSuccess) onLoginSuccess();
                                        }
                                    } catch (err) {
                                        toast.error(err.message || 'GitHub sign-in failed');
                                    }
                                }}
                                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-900 border border-gray-900 rounded-xl hover:bg-gray-800 transition-all text-sm font-medium text-white"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                                </svg>
                                GitHub
                            </button>
                        </div>

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
